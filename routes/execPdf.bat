:: %1 input %2 ouput
:: copy %1 to pdfbmdir
set pdfbmdir=pdfbm\
set if_up_path=upload\%1
set if_pdfbm_path=\pdfbmdir\%1
set of_pdfbm_path=\pdfbmdir\%2

::copy if_up_path to pdfbmdir
copy %if_up_path% %pdfbmdir%

::call pdfbm
cd %pdfbmdir%
serverPDFMark.exe %1 %2

::opf to ../upload
copy %2 ..\upload
::remove i and o files
del %1
del %2
del bookmarks.file
