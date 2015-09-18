

ALPHA			[a-zA-Z_]
ALNUM			[a-fA-F0-9]

%{


//var DEBUGLEX = function(msg) {};
var DEBUGLEX = console.log;
yy.value = null;
DEBUGLEX("STATE: ",YY_START);
DEBUGLEX("TEXT: ",yytext);

%}

%s table list
%x comment template link header

%%

"<!--"              { this.begin('comment'); DEBUGLEX("BEGINCOMMENT "); return 'BEGINCOMMENT'; }
<comment>[^-][^-]*     { DEBUGLEX("TEXT COMMENT ", yytext); /*node*/ return 'TEXT'; }
<comment>"-->"      { this.popState(); DEBUGLEX("ENDCOMMENT "); return 'ENDCOMMENT'; }

"{|"" "*    { this.begin('table'); DEBUGLEX("TABLEBEGIN ");   yy.value = yyleng-2;       return 'TABLEBEGIN';    }
<table>"||"" "*    { DEBUGLEX("TABLECELL1 (tablecell that starts with | is ommited");    yy.value = 2*(yyleng-2);   return 'TABLECELL';     }
<table>"!!"" "*    { DEBUGLEX("TABLEHEAD ");    yy.value = 2*(yyleng-2);   return 'TABLEHEAD';     }
<table>^"!"" "*    { DEBUGLEX("TABLEHEAD ");    yy.value = 2*(yyleng-1)+1; return 'TABLEHEAD';     }
<table>"|+"" "*    { DEBUGLEX("TABLECAPTION "); yy.value = yyleng-2;       return 'TABLECAPTION';  }
<table>"|""-"+" "* { DEBUGLEX("TABLEROW ");     yy.value = encodeTableRowInfo (yytext, yyleng); return 'TABLEROW'; }
<table>"|}"        { this.popState(); DEBUGLEX("TABLEEND "); return 'TABLEEND'; }


"[[:"             { this.begin('link'); DEBUGLEX("OPENLINK "); return 'OPENLINK'; }
"[["              { this.begin('link'); DEBUGLEX("OPENDBLSQBR "); return 'OPENDBLSQBR'; }
<link>"]]"              { this.popState('link'); DEBUGLEX("CLOSEDBLSQBR "); return 'CLOSEDBLSQBR'; }
<link>"|"                 { DEBUGLEX("PIPE "); return 'PIPE'; }



"{{"                { this.begin('template'); DEBUGLEX("OPENTEMPLATE "); return 'OPENTEMPLATE'; }
<template>"}}"                { this.popState(); DEBUGLEX("CLOSETEMPLATE "); return 'CLOSETEMPLATE'; }



\n                  { DEBUGLEX("NEWLINE\n"); return 'NEWLINE'; }
^" "*\n             { DEBUGLEX("NEWLINE\n"); return 'NEWLINE'; }
\r                  { /* ignore this one */ DEBUGLEX("<13> "); }

^" "                { DEBUGLEX("PRELINE "); return 'PRELINE'; }

^\*[ \t]*           { 
        if (YY_STATE!='list')
            this.begin('list'); 
        DEBUGLEX("LISTBULLET "); 
        return 'LISTBULLET'; }

^\#[ \t]*           { 
            if (YY_STATE!='list')
                this.begin('list'); 
            DEBUGLEX("LISTNUMBERED "); 
            return 'LISTNUMBERED'; }

^\:[ \t]* { 
    if (YY_STATE!='list')
        this.begin('list'); 

    DEBUGLEX("LISTIDENT "); 
    return 'LISTIDENT'; }



<heading>("="+)" "*\r?\n {
        this.popState();
        yy.value = this.matches[1].length
        DEBUGLEX("ENDHEADING(%d) ", yy.value);
        return 'ENDHEADING';
                                }


^"="+                           {
        this.begin('heading');
        yy.value = yytext.length;
        DEBUGLEX("HEADING(%d) ", yy.value);
        return 'HEADING';
}


.* {
    /*node*/
    DEBUGLEX("TEXT(%s) ", yytext);
    return 'TEXT';                                                                  
}





%%
