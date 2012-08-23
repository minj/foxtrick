#!/usr/bin/perl -w
# make gloassary with module names for crowdin in tbx format
#
# Author: convincedd
#

# get module file list from file *modules-names*
my @modules;
my $module_list = "module-names";
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
