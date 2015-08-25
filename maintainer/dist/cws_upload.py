#!/usr/bin/env python
from __future__ import print_function

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary

import os
import sys

from CWS.Credentials import LOGIN, PASS
FF_PATH = '/usr/bin/firefox'
EDIT_URL_TMPL = 'https://chrome.google.com/webstore/developer/edit/%s?hl=en-US&authuser=1'
EDIT_TITLE = 'Edit Item'
CWS_TITLE = 'Chrome Web Store'

def login(driver):
    print('Logging in into %s ...' % EDIT_URL)
    driver.get(EDIT_URL)
    print('...')

    elem = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.NAME, 'Email'))
    )
    elem.send_keys(LOGIN)
    try:
        # two-field login
        driver.find_element_by_name('Passwd')
        elem.send_keys(PASS)
    except NoSuchElementException:
        # single-field login
        elem.send_keys(Keys.ENTER)
        elem = WebDriverWait(driver, 30).until(
            EC.visibility_of_element_located((By.NAME, 'Passwd'))
        )
        elem.send_keys(PASS)

    elem.send_keys(Keys.ENTER)
    print('Submitting ...')

    WebDriverWait(driver, 30).until(lambda x: x.title[-len(EDIT_TITLE):] == EDIT_TITLE)
    print('...')

def upload(driver, path):
    elem = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '#cx-detail-pane input'))
    )
    elem.click()
    print('Entering upload form ...')

    elem = WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, '#cx-dev-upload-form input'))
    )
    print('...')

    driver.execute_script(
        '(function() {'
        'var input = document.querySelector("#cx-dev-upload-form input");'
        'input.style.visibility="visible";'
        'input.style.height = "50px";'
        '})();'
    )
    elem.send_keys(path)
    elem = driver.find_element_by_id('upload-btn')
    elem.click()
    print('Uploading %s ...' % path)

    WebDriverWait(driver, 300).until(lambda x: x.title[-len(EDIT_TITLE):] == EDIT_TITLE)
    print('...')

def publish(driver):
    elem = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[value="Publish changes"]'))
    )
    elem.click()
    print('Publishing ...')

    elem = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '#cx-confirm-publish input[value=OK]'))
    )
    elem.click()
    print('Confirming ...')

    WebDriverWait(driver, 60).until(lambda x: x.title[-len(CWS_TITLE):] == CWS_TITLE)
    print('Success.')

def run(infile):
    ff_bin = FirefoxBinary(FF_PATH)
    driver = webdriver.Firefox(firefox_binary=ff_bin)
    try:
        login(driver)
        upload(driver, infile)
        publish(driver)
    except Exception as err:
        print('Error at %s (%s)' % (driver.title, driver.current_url))
        raise err
    finally:
        driver.quit()

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: %s addonid infile.zip' % sys.argv[0])
    else:
        ZIP_IN = os.path.realpath(sys.argv[2])
        ADDON = sys.argv[1]
        EDIT_URL = EDIT_URL_TMPL % ADDON
        run(ZIP_IN)
