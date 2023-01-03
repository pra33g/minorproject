#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>
#include <windows.h>
#include <signal.h>
char *prepress;
char *CURRENT_DIR = NULL;
char *PATH_GS = NULL;
char *DEFAULT_PROGRAM_DIR = NULL;
char DEFAULT_DIR_FILE[] = "directory.dat";
typedef intptr_t ssize_t;

///////////////////////////
long getFileSize(FILE *f){
    long pos = ftell(f);
    fseek(f, 0 , SEEK_END);
    long size = ftell(f);
    fseek(f, pos, SEEK_SET);
    return size;
}
bool setDefDir (char *path){
    FILE *defdir_file_exists = fopen( DEFAULT_DIR_FILE, "r"); 
    if (path){
        FILE *def_dir = fopen (DEFAULT_DIR_FILE, "w");
        // fwrite(path, sizeof(char), sizeof(char) * strlen(path) +1, def_dir);
        fputs(path, def_dir);
        fclose(def_dir);
    }
    if (defdir_file_exists == NULL) {
        FILE *def_dir = fopen( DEFAULT_DIR_FILE, "w");
        path = (char * ) realloc (path, sizeof(char) * 20);
        strcpy (path, "C:\\Program Files\\" );
        // fwrite(path, sizeof(char), sizeof(char) * 20 + 1, def_dir);
        fputs(path, def_dir);
        free (path);
        fclose(def_dir);
    }
    FILE *def_dir = fopen ( DEFAULT_DIR_FILE, "r");
    long size = getFileSize(def_dir);
    DEFAULT_PROGRAM_DIR = (char *) malloc(size);
    fgets(DEFAULT_PROGRAM_DIR, size+1, def_dir);

    // fread(DEFAULT_PROGRAM_DIR, sizeof (char), sizeof(char) * size + 1, def_dir);
    fclose(def_dir);
    return true;    
}
bool gsExists(){
    // setDefDir(NULL);

    DWORD dir_len = GetCurrentDirectory(0 , NULL);
    CURRENT_DIR = (char *) malloc (dir_len*sizeof(char));
    GetCurrentDirectory(dir_len,CURRENT_DIR); 

    // setDefDir(CURRENT_DIR);
    printf("Current dir is %s\n", CURRENT_DIR);
    DEFAULT_PROGRAM_DIR = CURRENT_DIR;

    //print gs3x1.txt
    char cmd[1024];
    char tempfile_gspath[] = "gs3x1.txt";
    sprintf(cmd, "cd /d  \"%s\" && dir /b /s gs*c.exe > \"%s\\%s\"", DEFAULT_PROGRAM_DIR, CURRENT_DIR, tempfile_gspath);      
    // printf(cmd);
    bool found_gs = !system(cmd);
    if (found_gs){
        FILE *o_tempfile_gspath = fopen(tempfile_gspath, "r");
        if (!o_tempfile_gspath){
            printf("Failed");
        }
        //get file len
        fseek(o_tempfile_gspath,0,SEEK_END);
        long len = ftell(o_tempfile_gspath);
        rewind(o_tempfile_gspath);
        //len set
        PATH_GS = (char *) malloc (sizeof(char)*(len));
        fgets(PATH_GS, len, o_tempfile_gspath);
        fclose(o_tempfile_gspath);
        printf("\nGhostscript GPL found in %s", PATH_GS );
        return true;
    }
    // remove(tempfile_gspath);
    return found_gs;
}



/////////


ssize_t getlineud(char **lineptr, size_t *n, FILE *stream) {
    size_t pos;
    int c;

    if (lineptr == NULL || stream == NULL || n == NULL) {
        errno = SIGINT;
        return -1;
    }

    c = getc(stream);
    if (c == EOF) {
        return -1;
    }

    if (*lineptr == NULL) {
        *lineptr = malloc(128);
        if (*lineptr == NULL) {
            return -1;
        }
        *n = 128;
    }

    pos = 0;
    while(c != EOF) {
        if (pos + 1 >= *n) {
            size_t new_size = *n + (*n >> 2);
            if (new_size < 128) {
                new_size = 128;
            }
            char *new_ptr = realloc(*lineptr, new_size);
            if (new_ptr == NULL) {
                return -1;
            }
            *n = new_size;
            *lineptr = new_ptr;
        }

        ((unsigned char *)(*lineptr))[pos ++] = c;
        if (c == '\n') {
            break;
        }
        c = getc(stream);
    }

    (*lineptr)[pos] = '\0';
    return pos;
}


int* checkBookmarks(FILE **bookmarks, int *_n_lines){
	
	int n_lines_ = 0;
	
	char *line =NULL;
	size_t size = 0;
	while(getlineud(&line,&size,*bookmarks)>0){
		n_lines_++;
	}
	free(line);
	fseek(*bookmarks,0,SEEK_SET);

	const int n_lines = n_lines_;
	int *treeArr =  (int *)calloc(n_lines+2,sizeof(int));
	{
		char *line =NULL;
		size_t size = 0;
		int i = 0;
		int temp=getlineud(&line,&size,*bookmarks);
		bool exit_true=false;
		while(temp>0){
			if(temp==1){				//check for empty lines
				if(exit_true){
					printf(", %d",i+1);
				} else {
					printf("Please remove empty line at lines: [%d",i+1);
				}
				exit_true=true;
			}
			int count = 0,sub_index = 0;
			while(line[sub_index++]==9){
				count++;
			}
			treeArr[i++]=count;
			temp=getlineud(&line,&size,*bookmarks);
		}
		free(line);
		if (exit_true){
			printf("] in bookmarks.file.\n");
			return NULL;
		}
//error check more than 1 tab per level
		for (int i = 0; i < n_lines; i++){
			int tabdiff=treeArr[i+1]-treeArr[i];
			if(tabdiff>1){
				printf("Extra tabs at %d.\nUse only 1 tab per level.\n",i+2);
				return NULL;
			}
		}
	 
	}


	{
		for (int i = 0; i< n_lines; i++){ 
			int j=i+1;
			int count = 0;
			if(treeArr[j]-treeArr[i]==1){
				while (treeArr[j]-treeArr[i]>=1)
				{
					if(treeArr[j]-treeArr[i]==1){
						count++;
					}
					j++;
				}
			}
			treeArr[i]=count;
		}		
	}
	*_n_lines = n_lines;
	return treeArr;
}

bool writePostScriptFile(char *bookmarks_name, const int n_lines, int *treeArr, short page_offset){
    printf("\n\nWriting PS File\n");
    char settings_file[]="53++1Nq5.txt";

    prepress = (char *) malloc (strlen(settings_file));
    strcpy( prepress, settings_file);


    FILE *settings=fopen(settings_file,"w"),
        *bookmarks = fopen(bookmarks_name,"r");
    long sizelen;
    char *line=NULL;
    size_t size=0;
    fseek(bookmarks,0,SEEK_SET);
    printf("Executing...\n");
    char *title=NULL;
        for (int i = 0; i < n_lines; i++)
        {
            unsigned pgno;
            sizelen=getlineud(&line,&size,bookmarks);
            title=(char*)realloc(title,sizelen*sizeof(char));

            if(!title){
                fclose(settings);
                return false;
            }


            int temp=sscanf(line,"%d %[^\n]s",&pgno,title);

            if(treeArr[i]){
                if(temp==2){
                    fprintf(settings,"[/Count %d /Page %d /Title (%s) /OUT pdfmark\n",treeArr[i],pgno+page_offset, title);
                } else{
                    free(title);
	                free(line);
                    // reportErrors(i+1);
                    fclose(settings);
                    return false;
                }
            }else{
                if(temp==2){
                    fprintf(settings,"[/Page %d /Title (%s) /OUT pdfmark\n",pgno+page_offset, title);
                }else{
                    free(title);
                    free(line);
                    // reportErrors(i+1);
                    fclose(settings);
                    return false;
                }
            }
            
        }
	free(title);
	free(line);
    fclose(settings);
    return true;
}

void addBookmarks(char *output_name, char *input_name, char *bookmarks_name){
    char cmd[2048];
    PATH_GS[strlen(PATH_GS)-1] = 0;

    // printf("%s", prepress);

    sprintf(cmd,"\"%s\" -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile=%s -dPDFSETTINGS=/prepress %s %s", PATH_GS, output_name, prepress, input_name);
    printf("%s",cmd);

    bool done = !system(cmd);
    if (done){
        printf("\nSuccessful!");
    } else {
        printf("\nThere was some error.");
    }    
    remove(prepress);
}


int main(int argc, char* argv[]) {
    gsExists();
    int page_offset=0;
	
    char bookmarks_name[50] = "bookmarks.file",
         output_name[500] = "NOT_SET",
         input_name[500] = "NOT_SET",
         not_set[] = "NOT_SET",
         temp;
    bool add_bookmarks = false;
    int n_lines_;  //temp storage for const int n_lines
    int *treeArr;


    // char tempin[500] = "ff.pdf";
    // char tempon[500] = "of.pdf";
    // strcpy(input_name, tempin);
    // strcpy(output_name, tempon);
    // printf("%s \n%s", input_name, output_name);


    FILE *bookmarks = fopen(bookmarks_name,"r"),
        *input = fopen(input_name,"r"),
        *output = fopen(output_name,"r");
    strcpy(input_name, argv[1]);
	strcpy(output_name , argv[2]);
    printf("%s \n%s",argv[1], argv[2]);

    //check bookmarks.file for errors free lines errors, tab errors and create bookmark tree
    //store number of lines 
    treeArr = checkBookmarks(&bookmarks,&n_lines_); //store bookmark tree
    if (treeArr){
        add_bookmarks = true;
    } else {
        add_bookmarks = false;
    }
    fclose(bookmarks);

    if(add_bookmarks){
        bool writtenPS = writePostScriptFile(bookmarks_name, n_lines_, treeArr, page_offset);
        if (writtenPS){
            printf("\n\nWritten PS file\n\n");
            addBookmarks(output_name, input_name, bookmarks_name);
        }
        else {
            printf("\n\nError writing PS file. \n\nReport to pdfbmdev@example.com (It helps me make PDFBookmark better for a lot of people :)");
        }
        //addBookmarks();
        free(treeArr);

    }
    else {
        printf("\n\n Quit.");
    }
    return 0;

















}