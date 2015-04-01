#!/usr/bin/env python
from __future__ import print_function

import os, sys
import codecs
import json

from Hattrick.Parsers import XMLParser

'''
Currency dict constructor
'''
class Currency(dict):
    def __init__(self, league):
        super(dict, self).__init__()
        self['symbol'] = league['currency']
        self['eurorate'] = league['rate']
        self['code'] = ''
        self['name'] = ''
        self['leagues'] = { int(league['id']): league['name'] }

def parse_worlddetails(input_file):
    with codecs.open(input_path, mode='r', encoding='utf-8') as input_file:
        details = json.load(input_file)

    league_list = details['HattrickData']['LeagueList']
    league_map = {}
    for league in league_list:
        l_id = league['LeagueID']
        l_name = league['EnglishName']
        c_name = league['Country']['CurrencyName']
        c_rate = league['Country']['CurrencyRate']
        # deal with HT number system and convert from SEK to EUR
        c_rate = str(float(c_rate.replace(',', '.')) / 10)
        league_map[l_id] = { 'id': l_id, 'name': l_name, 'currency': c_name, 'rate': c_rate }

    return league_map

def make_currency_map(league_map):
    cur_map = {}
    for l in league_map.values():
        # index cur_map by (symbol, rate)
        cur = cur_map.setdefault((l['currency'], l['rate']), Currency(league=l))
        # use integer keys for better sorting in JSON
        cur['leagues'][int(l['id'])] = l['name']

    return cur_map

def get_old_currencies(input_dir):
    input_path = input_dir + '/htcurrency.json'
    with codecs.open(input_path, mode='r', encoding='utf-8') as cur_file:
        cur_json = json.load(cur_file)

    return cur_json['hattrickcurrencies']

def output_currencies(output_dir, cur_list):
    output_path = output_dir + '/htcurrency.json'
    output = { 'hattrickcurrencies': cur_list }
    with codecs.open(output_path, mode='w', encoding='utf-8') as cur_file:
        cur_file.write(XMLParser.python_to_json(output))

def run(input_path):
    leagues = parse_worlddetails(input_path)
    cur_map = make_currency_map(leagues)
    # make a copy to keep track of 'untouched' items
    new_curs = cur_map.copy()

    input_dir = os.path.dirname(input_path)
    old_list = get_old_currencies(input_dir)

    missing = []
    cur_list = []
    for cur in old_list:
        same = cur_map.get((cur['symbol'], cur['eurorate']))
        if same is not None:
            # rate/symbol unchanged
            cur_list.append(cur)
            # update league list
            cur['leagues'] = same['leagues']
            try:
                # this currency is not new
                new_curs.pop((same['symbol'], same['eurorate']))
            except KeyError:
                # duplicate, already removed
                pass
        else:
            # old currency not found
            missing.append(cur)
            pass

    # add new currencies: ORDER BY symbol, eurorate
    new_list = sorted(sorted(new_curs.values(), key=lambda c:c['eurorate']),
                      key=lambda c:c['symbol'])
    cur_list.extend(new_list)
    # backup missing currencies
    for cur in missing:
        # remove league definition
        try:
            cur.pop('leagues')
        except KeyError:
            pass

    cur_list.extend(missing)

    output_currencies(input_dir, cur_list)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        input_path = sys.argv[1]
    else:
        scriptDir = os.path.dirname(os.path.abspath(__file__))
        input_path = '%s/../../content/data/worlddetails.json' % (scriptDir)

    run(input_path)
