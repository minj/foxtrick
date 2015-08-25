#!/usr/bin/env python
from __future__ import print_function

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary

import subprocess
import os
import sys

from AMO.Credentials import LOGIN, PASS

FF_PATH = '/usr/bin/firefox'
ADDON = 'foxtrick'
LOGIN_URL = 'https://addons.mozilla.org/en-US/firefox/users/login?to=%2Fen-US%2Ffirefox%2F'
UPLOAD_URL = 'https://addons.mozilla.org/en-US/developers/addon/%s/versions#version-upload' % ADDON
ADDON_URL = 'https://addons.mozilla.org/en-US/developers/addon/%s/versions' % ADDON
MANAGE_TITLE = 'Manage Version'

def login(driver):
    print('Logging in into %s ...' % LOGIN_URL)
    driver.get(LOGIN_URL)
    print('...')

    elem = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.NAME, 'username'))
    )
    elem.send_keys(LOGIN)
    elem = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.NAME, 'password'))
    )
    elem.send_keys(PASS)
    elem.send_keys(Keys.ENTER)

    print('Submitting ...')
    WebDriverWait(driver, 30).until(lambda x: x.title == 'Add-ons for Firefox')

def upload(driver, path):
    print('Uploading at %s ...' % UPLOAD_URL)
    driver.get(UPLOAD_URL)
    print('...')

    elem = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.CLASS_NAME, 'upload-file'))
    )
    elem = driver.find_element_by_id('upload-addon')

    print('...')
    elem.send_keys(path)
    print('Uploading %s ...' % path)
    elem = driver.find_element_by_id('upload-file-finish')
    WebDriverWait(driver, 300).until(lambda x: elem.is_enabled())

    print('Adding version ...')
    elem.click()

def find_last_version(driver):
    print('Trying %s manually...' % ADDON_URL)
    driver.get(ADDON_URL)
    elem = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '#current-version-status a'))
    )
    print('...')
    elem.click()
    WebDriverWait(driver, 30).until(lambda x: x.title[:len(MANAGE_TITLE)] == MANAGE_TITLE)

def download(driver, path):
    try:
        WebDriverWait(driver, 60).until(lambda x: x.title[:len(MANAGE_TITLE)] == MANAGE_TITLE)
    except TimeoutException:
        # README: always happens with Xvfb AKA 'headless'
        print('Timeout.')
        find_last_version(driver)

    print('Downloading from %s ...' % driver.current_url)
    elem = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '#file-list a'))
    )
    url = elem.get_attribute('href')

    print('Downloading %s to %s ...' % (url, path))
    cookie = driver.get_cookie('sessionid')['value']
    cmd = ['curl', '-L', '-b', 'sessionid=' + cookie, '-o', path, url]
    retcode = subprocess.call(cmd)
    if retcode:
        raise Exception('curl exited with status: %s' % retcode)

    print('Success.')

def run(infile, outfile):
    try:
        ff_bin = FirefoxBinary(FF_PATH)
        driver = webdriver.Firefox(firefox_binary=ff_bin)
        login(driver)
        upload(driver, infile)
        download(driver, outfile)
    except Exception as err:
        print('Error at %s (%s)' % (driver.title, driver.current_url))
        raise err
    finally:
        driver.quit()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: %s infile.xpi [outfile.xpi]' % sys.argv[0])
    else:
        XPI_IN = os.path.realpath(sys.argv[1])
        if len(sys.argv) < 3:
            XPI_OUT = XPI_IN
        else:
            XPI_OUT = sys.argv[2]

        run(XPI_IN, XPI_OUT)
