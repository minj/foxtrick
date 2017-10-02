#!/usr/bin/python
'''
make glossary with module names for crowdin in tbx format

Author: LA-MJ, convincedd
'''

import sys
import codecs

HEADER = '<?xml version="1.0" encoding="utf-8"?>\n<martif type="TBX-Basic" xml:lang="en">\n'
FOOTER = '</martif>\n'
TEMPLATE = '''<text><body><termEntry><langSet xml:lang="en">
    <tig><term>{}</term></tig>
    <note>This module name is used to link to the appropriate module. Don't translate it!</note>
</langSet></termEntry></body></text>
'''

def make_glossary(i_name, o_name):
    print('making %s from %s' % (o_name, i_name))
    with codecs.open(i_name, mode='r', encoding='utf-8') as source:
        with codecs.open(o_name, mode='w', encoding='utf-8') as dest:
            dest.write(HEADER)

            for line in source:
                dest.write(TEMPLATE.format(line.strip()))

            dest.write(FOOTER)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        OUTPUT = 'crowdin-glossary.tbx'
    else:
        OUTPUT = sys.argv[2]

    if len(sys.argv) < 2:
        INPUT = 'module-names'
    else:
        INPUT = sys.argv[1]

    make_glossary(INPUT, OUTPUT)
