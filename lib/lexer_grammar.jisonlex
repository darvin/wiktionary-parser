

ALPHA			[a-zA-Z_]
ALNUM			[a-fA-F0-9]
NONBR           [^\n]

%{


//var DEBUGLEX = function(msg) {};
var DEBUGLEX = console.log;
yy.value = null;
DEBUGLEX("STATE: ",YY_START);
DEBUGLEX("TEXT: ",yytext);



%}

%s table list template templateargvalue
%x comment link heading  templateargvalueQ  templateargvalueAPO

%%

"<!--"              { this.begin('comment'); DEBUGLEX("BEGINCOMMENT "); return 'BEGINCOMMENT'; }
<comment>[^-][^-]*     { DEBUGLEX("TEXT COMMENT ", yytext); /*node*/ return 'TEXT'; }
<comment>"-->"      { this.popState(); DEBUGLEX("ENDCOMMENT "); return 'ENDCOMMENT'; }

\n                  { DEBUGLEX("NEWLINE\n"); return 'NEWLINE'; }
^" "*\n             { DEBUGLEX("NEWLINE\n"); return 'NEWLINE'; }
\r                  { /* ignore this one */ DEBUGLEX("<13> "); }

^" "                { DEBUGLEX("PRELINE "); return 'PRELINE'; }


"{|"" "*    { this.begin('table'); DEBUGLEX("TABLEBEGIN ");   yy.value = yyleng-2;       return 'TABLEBEGIN';    }
<table>"||"" "*    { DEBUGLEX("TABLECELL1 (tablecell that starts with | is ommited");    yy.value = 2*(yyleng-2);   return 'TABLECELL';     }
<table>"!!"" "*    { DEBUGLEX("TABLEHEAD ");    yy.value = 2*(yyleng-2);   return 'TABLEHEAD';     }
<table>^"!"" "*    { DEBUGLEX("TABLEHEAD ");    yy.value = 2*(yyleng-1)+1; return 'TABLEHEAD';     }
<table>"|+"" "*    { DEBUGLEX("TABLECAPTION "); yy.value = yyleng-2;       return 'TABLECAPTION';  }
<table>"|""-"+" "* { DEBUGLEX("TABLEROW ");     yy.value = encodeTableRowInfo (yytext, yyleng); return 'TABLEROW'; }
<table>"|}"        { this.popState(); DEBUGLEX("TABLEEND "); return 'TABLEEND'; }


"[[:"             { this.begin('link'); DEBUGLEX("OPENLINK "); return 'OPENLINK'; }
"[["              { this.begin('link'); DEBUGLEX("OPENDBLSQBR "); return 'OPENDBLSQBR'; }
<link>[^\n\]]+"]" { this.less(yytext.length-1); DEBUGLEX("TEXT(%s) ", yytext);  return 'TEXT'; }
<link>"]]"              { this.popState(); DEBUGLEX("CLOSEDBLSQBR "); return 'CLOSEDBLSQBR'; }
<link>"|"                 { DEBUGLEX("PIPE "); return 'PIPE'; }

"["     return 'OPENSQBR';
"]"     return 'CLOSESQBR';


"{{"                { this.begin('template'); DEBUGLEX("OPENTEMPLATE "); return 'OPENTEMPLATE'; }
<template>[^=\}\|]+"=" { 
    this.less(yytext.length-1);
    DEBUGLEX("ATTRIBUTE(%s) ", yytext); 
    return 'ATTRIBUTE'; 
    }
<templateargvalue>"|"   {this.popState(); return 'PIPE';}

<template>"|"   {return 'PIPE';}
<template>"="   { this.begin('templateargvalue');  return 'EQUALS';}

<template>[^=\}\|]+ {
    DEBUGLEX("TEXT(%s) ", yytext); 
    return 'TEXT'; 
    }
<templateargvalue>\"   { this.begin('templateargvalueQ');  return 'ATTRQ'; }
<templateargvalueQ>\"   { this.popState();this.popState();  return 'ATTRQ'; }
<templateargvalue>\'   { this.begin('templateargvalueAPO');  return 'ATTRAPO'; }
<templateargvalueAPO>\'   { this.popState();this.popState();  return 'ATTRAPO'; }
<templateargvalueQ>[^\"]+ { return 'TEXT'; }
<templateargvalueAPO>[^\']+ { return 'TEXT'; }
<templateargvalue>[^\}\|]+ { this.popState(); return 'TEXT'; }

<template>"}}"                { this.popState(); DEBUGLEX("CLOSETEMPLATE "); return 'CLOSETEMPLATE'; }




^\*[ \t]*           { 
        if (YYSTATE!='list')
            this.begin('list'); 
        DEBUGLEX("LISTBULLET "); 
        return 'LISTBULLET'; }

^\#[ \t]*           { 
            if (YYSTATE!='list')
                this.begin('list'); 
            DEBUGLEX("LISTNUMBERED "); 
            return 'LISTNUMBERED'; }

^\:[ \t]* { 
    if (YYSTATE!='list')
        this.begin('list'); 

    DEBUGLEX("LISTIDENT "); 
    return 'LISTIDENT'; }



<heading>("="+)" "*\r?\n {
        this.popState();
        yy.value = this.matches[1].length
        DEBUGLEX("ENDHEADING(%d) ", yy.value);
        return 'ENDHEADING';
                                }
<heading>[^\n=]+"=" { this.less(yytext.length-1); DEBUGLEX("TEXT(%s) ", yytext);  return 'TEXT'; }


^"="+     {
        this.begin('heading');
        yy.value = yytext.length;
        DEBUGLEX("HEADING(%d) ", yy.value);
        return 'HEADING';
}

^[^=]?[^\[\{\n]+ { DEBUGLEX("TEXT(%s) ", yytext); return 'TEXT'; }




%%
