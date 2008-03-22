@del /q /s temp
@del foxtrick.xpi
@mkdir temp

@echo Copying files
@xcopy ..\extension temp /S /I /Q /Y /EXCLUDE:exclude.txt
replace ..\chrome.manifest temp

cd temp\chrome
zip -0 -r -m foxtrick.jar  * -x \*.svn\*

echo Entering build dir
@cd ..

zip -r ..\foxtrick.xpi *

@cd ..
@del /q /s temp
