#!/usr/bin/perl -w
# Update module listing in manifest files
#
# Author: Ryan Li <ryan@ryanium.com>
#
# arguments
# first: filename of categorized modules file
# second: filename of ignored modules file
# third: path to targets

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
	},
	{
		"file" => "content/scripts-fennec.js",
		"from" => "//<!-- categorized modules -->",
		"to" => "//<!-- end categorized modules -->",
		"prefix" => "\t\t\"",
		"suffix" => "\",\n"
	},
	{
		"file" => "content/bootstrap-firefox.js",
		"from" => "<!-- categorized modules -->",
		"to" => "<!-- end categorized modules -->",
		"prefix" => "\t\t\"",
		"suffix" => "\",\n"
	},
	# different path for opera
	{
		"file" => "background.html",
		"from" => "<!-- categorized modules -->",
		"to" => "<!-- end categorized modules -->",
		"prefix" => "\t<script type=\"application/x-javascript\" src=\"./",
		"suffix" => "\"></script>\n"
	},
	{
		"file" => "preferences.html",
		"from" => "<!-- categorized modules -->",
		"to" => "<!-- end categorized modules -->",
		"prefix" => "\t<script type=\"application/x-javascript\" src=\"./",
		"suffix" => "\"></script>\n"
	}
);

# get module file list from file *modules*
my @modules;
my $module_list = $ARGV[0];
open(MODULES, "<" . $module_list);
while ($file = <MODULES>) {
	chop($file);
	push(@modules, $file);
}
close(MODULES);

my @ignored_modules;
my $ignored_module_list = $ARGV[1];
open(IGNORED_MODULES, "<" . $ignored_module_list);
while ($file = <IGNORED_MODULES>) {
	chop($file);
	if ($file) {
		push(@ignored_modules, $file);
	}
}
close(IGNORED_MODULES);

my $path = $ARGV[2];

foreach my $target (@targets) {
	my $content = "";
	open(TARGET, "<" . $path . $target->{"file"}) || next;
	print "handle " . $path . $target->{"file"} . "\n";

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

	# remove entries from ignored_modules
	my $cleaned_content = "";

	my @lines = split(/\n/, $content);
	foreach my $line (@lines) {
		my $ignore = 0;
		foreach my $module (@ignored_modules) {
			if ($line =~ $module) {
				$ignore = 1;
			}
		}
		if ( $ignore == 0 ) {
			$cleaned_content .= $line . "\n";
		}
	}

	open(TARGET, ">" . $path . $target->{"file"});
	print TARGET $cleaned_content;
	close(TARGET);
}

# remove files from ignored_modules
foreach my $module (@ignored_modules) {
	my ($directory, $filename) = $module =~ m/(.+\/)(.+)$/;
	print "remove " . $filename . "\n";
	# ff,chrome,safari
	unlink($path . "content/" . $module);
	#opera
	unlink($path . "includes/" . $filename);
}
