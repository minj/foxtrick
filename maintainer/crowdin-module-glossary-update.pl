#!/usr/bin/perl -w
# Update module names as glossary terms in crwodin
#
# Author: convincedd
#
# not working since we don't have a list of module names
# would be just a file with module names in seperate lines just like modules is with file names

# get module file list from file *modules*
my @modules;
my $module_list = "../modules-names";
open(MODULES, "<" . $module_list);
while ($file = <MODULES>) {
	chop($file);
	push(@modules, $file);
}
close(MODULES);


print "make module glossay\n";

my $content = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
$content .= "<martif type=\"TBX-Basic\" xml:lang=\"en\">\n";

my $prefix = "<text><body><termEntry><langSet xml:lang=\"en\"><tig><term>";
my $suffix = "</term></tig><note>This module name is used to link to the appropriate module. Don't translate it!</note></langSet></termEntry></body></text>\n";
foreach my $module (@modules) {
	$content .= $prefix . $module . $suffix;
}

$content .= "</martif>\n";

open(TARGET, ">" . "crowdin-glossary.tbx");
print TARGET $content;	
close(TARGET);
