#!/usr/bin/perl -w
# Update module listing in manifest files
#
# Author: Ryan Li <ryan@ryanium.com>

my @targets = (
	{
		"file" => "manifest.json",
		"from" => "//<!-- categorized modules -->",
		"to" => "//<!-- end categorized modules -->",
		"prefix" => "\t\t\t\"content/",
		"suffix" => "\",\n"
	},
	{
		"file" => "Info.plist",
		"from" => "<!-- categorized modules -->",
		"to" => "<!-- end categorized modules -->",
		"prefix" => "\t\t\t\t<string>content/",
		"suffix" => "</string>\n"
	},
	{
		"file" => "content/scripts-fennec.js",
		"from" => "//<!-- categorized modules -->",
		"to" => "//<!-- end categorized modules -->",
		"prefix" => "\t\t\"",
		"suffix" => "\",\n"
	},
	{
		"file" => "content/preferences.html",
		"from" => "<!-- categorized modules -->",
		"to" => "<!-- end categorized modules -->",
		"prefix" => "\t<script type=\"application/x-javascript\" src=\"./",
		"suffix" => "\"></script>\n"
	},
	{
		"file" => "content/background.html",
		"from" => "<!-- categorized modules -->",
		"to" => "<!-- end categorized modules -->",
		"prefix" => "\t<script type=\"application/x-javascript\" src=\"./",
		"suffix" => "\"></script>\n"
	},
	{
		"file" => "content/overlay.xul",
		"from" => "<!-- categorized modules -->",
		"to" => "<!-- end categorized modules -->",
		"prefix" => "<script type=\"application/x-javascript\" src=\"./",
		"suffix" => "\"></script>\n"
	}
);

# get module file list from file *modules*
my @modules;
open(MODULES, "<modules");
while ($file = <MODULES>) {
	chop($file);
	push(@modules, $file);
}
close(MODULES);

foreach my $target (@targets) {
	my $content = "";
	open(TARGET, "<" . $target->{"file"});

	my $line;
	while (my $line = <TARGET>) {
		$content .= $line;
		if ($line =~ $target->{"from"}) {
			last;
		}
	}

	foreach my $module (@modules) {
		$content .= $target->{"prefix"} . $module . $target->{"suffix"};
	}

	while (my $line = <TARGET>) {
		if ($line =~ $target->{"to"}) {
			$content .= $line;
			last;
		}
	}

	while (my $line = <TARGET>) {
		$content .= $line;
	}

	close(TARGET);

	open(TARGET, ">" . $target->{"file"});
	print TARGET $content;
	close(TARGET);
}
