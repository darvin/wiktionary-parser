

ALPHA			[a-zA-Z_]
ALNUM			[a-fA-F0-9]

%{
var __l = this;
var COMMONTOKENS=function(){
    if (YY_START != 'inattributeapo' && YY_START != 'inattributeq' && YY_START != 'canbeheading') {
        __l.begin('cannotbelistorheadingorpre');
    }

}

//var DEBUGLEX = function(msg) {};
var DEBUGLEX = console.log;
yy.value = null;
DEBUGLEX("STATE: ",YY_START);
DEBUGLEX("TEXT: ",yytext);

%}

%s extension attributes canbelist canbeheading cannotbelistorheadingorpre table
%x comment startattribute inattributeapo inattributeq

%%

"<!--"              { this.begin('comment'); DEBUGLEX("BEGINCOMMENT "); return 'BEGINCOMMENT'; }
<comment>[^-][^-]*     { DEBUGLEX("TEXT COMMENT ", yytext); /*node*/ return 'TEXT'; }
<comment>"-->"      { this.begin('cannotbelistorheadingorpre'); DEBUGLEX("ENDCOMMENT "); return 'ENDCOMMENT'; }

"{|"" "*    { this.begin('table'); DEBUGLEX("TABLEBEGIN ");   yy.value = yyleng-2;       return 'TABLEBEGIN';    }
<table>"||"" "*    { DEBUGLEX("TABLECELL1 (tablecell that starts with | is ommited");    yy.value = 2*(yyleng-2);   return 'TABLECELL';     }
<table>"!!"" "*    { DEBUGLEX("TABLEHEAD ");    yy.value = 2*(yyleng-2);   return 'TABLEHEAD';     }
<table>^"!"" "*    { DEBUGLEX("TABLEHEAD ");    yy.value = 2*(yyleng-1)+1; return 'TABLEHEAD';     }
<table>"|+"" "*    { DEBUGLEX("TABLECAPTION "); yy.value = yyleng-2;       return 'TABLECAPTION';  }
<table>"|""-"+" "* { DEBUGLEX("TABLEROW ");     yy.value = encodeTableRowInfo (yytext, yyleng); return 'TABLEROW'; }
<table>"|}"        { this.popState(); DEBUGLEX("TABLEEND "); return 'TABLEEND'; }

<attributes>[-a-zA-Z:_]+" "* {
        DEBUGLEX("ATTRIBUTE(%s) ", yytext);
        return 'ATTRIBUTE';
    }
<attributes>"="" "*          {
        DEBUGLEX("EQUALS(%d) ", yyleng-1);
        yy.value = yyleng-1;
        this.begin('startattribute');
        return 'EQUALS';
    }

<startattribute>\'      { this.begin('inattributeapo'); yy.value = 0;        DEBUGLEX("ATTRAPO(0) ");             return 'ATTRAPO'; }
<startattribute>\"      { this.begin('inattributeq');   yy.value = 0;        DEBUGLEX("ATTRQ(0) ");               return 'ATTRQ';   }
<inattributeapo>\'" "*  { this.popState();  this.popState();   yy.value = yyleng-1; DEBUGLEX("ATTRAPO(%d) ", yyleng-1); return 'ATTRAPO'; }
<inattributeq>\"" "*    { this.popState(); this.popState();    yy.value = yyleng-1; DEBUGLEX("ATTRQ(%d) ",   yyleng-1); return 'ATTRQ';   }



"[[:"             { COMMONTOKENS(); DEBUGLEX("OPENLINK "); return 'OPENLINK'; }
"[["              { COMMONTOKENS(); DEBUGLEX("OPENDBLSQBR "); return 'OPENDBLSQBR'; }
"]]"              { COMMONTOKENS(); DEBUGLEX("CLOSEDBLSQBR "); return 'CLOSEDBLSQBR'; }
"|"                 { DEBUGLEX("PIPE "); return 'PIPE'; }
"{{{{{"          { COMMONTOKENS(); DEBUGLEX("OPENPENTUPLECURLY "); return 'OPENPENTUPLECURLY'; }
"}}}}}"          { COMMONTOKENS(); DEBUGLEX("CLOSEPENTUPLECURLY "); return 'CLOSEPENTUPLECURLY'; }
"{{{{"            { COMMONTOKENS(); DEBUGLEX("OPENTEMPLATE "); this.less(2); return 'OPENTEMPLATE'; }
"}}}}"            { COMMONTOKENS(); DEBUGLEX("CLOSETEMPLATE "); this.less(2); return 'CLOSETEMPLATE'; }
"{{{"              { COMMONTOKENS(); DEBUGLEX("OPENTEMPLATEVAR "); return 'OPENTEMPLATEVAR'; }
"}}}"              { COMMONTOKENS(); DEBUGLEX("CLOSETEMPLATEVAR "); return 'CLOSETEMPLATEVAR'; }
"{{"                { this.begin('attributes'); DEBUGLEX("OPENTEMPLATE "); return 'OPENTEMPLATE'; }
"}}"                { COMMONTOKENS(); DEBUGLEX("CLOSETEMPLATE "); return 'CLOSETEMPLATE'; }



\n                  { this.begin('INITIAL'); DEBUGLEX("NEWLINE\n"); return 'NEWLINE'; }
^" "*\n             { this.begin('INITIAL'); DEBUGLEX("NEWLINE\n"); return 'NEWLINE'; }
\r                  { /* ignore this one */ DEBUGLEX("<13> "); }

^" "                { this.begin('cannotbelistorheadingorpre'); DEBUGLEX("PRELINE "); return 'PRELINE'; }
^\*[ \t]*           { this.begin('canbelist'); DEBUGLEX("LISTBULLET "); return 'LISTBULLET'; }
<canbelist>\*[ \t]*                   { DEBUGLEX("LISTBULLET "); return 'LISTBULLET'; }

^\#[ \t]*           { this.begin('canbelist'); DEBUGLEX("LISTNUMBERED "); return 'LISTNUMBERED'; }
<canbelist>\#[ \t]* { DEBUGLEX("LISTNUMBERED "); return 'LISTNUMBERED'; }
<canbelist>\:[ \t]* { DEBUGLEX("LISTDEFINITION "); return 'LISTDEFINITION'; }

^:[ \t]+           { this.begin('canbelist'); DEBUGLEX("LISTIDENT "); return 'LISTIDENT'; }
<canbelist>:[ \t]+ { DEBUGLEX("LISTIDENT "); return 'LISTIDENT'; }

<canbeheading>"="+" "*\r\n {
                                    yy.value = 0;
                                    while (yytext [ yy.value ] == '=')
                                        yy.value++;
                                    DEBUGLEX("ENDHEADING(%d) ", yy.value);
                                    return 'ENDHEADING';
                                }
<canbeheading>"="+" "*\n        {
                                    yy.value = 0;
                                    while (yytext [ yy.value ] == '=')
                                        yy.value++;
                                    DEBUGLEX("ENDHEADING(%d) ", yy.value);
                                    return 'ENDHEADING';
                                }

^"="+                           {
                                    this.begin('canbeheading');
                                    yy.value = yytext.length;
                                    DEBUGLEX("HEADING(%d) ", yy.value);
                                    return 'HEADING';
                                }


<cannotbelistorheadingorpre,canbeheading>[^\!\|\r\n][^\<\>\[\]\{\}\r\n\'\|\=\!]* {
    /*node*/
    DEBUGLEX("TEXT(%s) ", yytext);
    return 'TEXT';                                                                    }
<cannotbelistorheadingorpre,canbeheading>\!  {
    /*node*/
    DEBUGLEX("TEXT(%s) ", yytext);
    return 'TEXT';                                                                    }
<inattributeapo>[^\'\|\r\n][^\<\>\[\]\{\}\r\n\'\|\=\!]* {
    /*node*/
    DEBUGLEX("TEXT(%s) ", yytext);
    return 'TEXT';                                                                    }
<inattributeq>[^\"\|\r\n][^\<\>\[\]\{\}\r\n\'\"\|\=\!]*                             {
    /*node*/
    DEBUGLEX("TEXT(%s) ", yytext);
    return 'TEXT';                                                                    }

<canbelist>[^ \!\|\*\#:\r\n][^\<\>\[\]\{\}\r\n\'\|\!]*   {
    this.begin('cannotbelistorheadingorpre');
    /*node*/
    DEBUGLEX("TEXT(%s) ", yytext);
    return 'TEXT';                                                                    }
<canbelist>\!            {
    this.begin('cannotbelistorheadingorpre');
    /*node*/
    DEBUGLEX("TEXT(%s) ", yytext);
    return 'TEXT';                                                                    }
<attributes>[^-a-zA-Z:_\r\n\|\=][^\<\>\[\]\{\}\r\n\'\|\!]*  {
    this.begin('cannotbelistorheadingorpre');
    /*node*/
    DEBUGLEX("TEXT in attr(%s) ", yytext);
    return 'TEXT';                                                                    }
<INITIAL>[^ \!\|\*\#:\r\n\=][^\<\>\[\]\{\}\r\n\'\|\=\!]*  {
    this.begin('cannotbelistorheadingorpre');
    /*node*/
    DEBUGLEX("TEXT(%s) ", yytext);
    return 'TEXT';                                                                    }
<INITIAL>\!    {
    this.begin('cannotbelistorheadingorpre');
    /*node*/
    DEBUGLEX("TEXT(%s) ", yytext);
    return 'TEXT';                                                                    }

<startattribute>[^ \t\r\n\'\"\|][^ \t\r\n\|\}]*" "*   {
    this.begin('attributes');
    /*node*/
    DEBUGLEX("TEXT str attr(%s) ", yytext);
    return 'TEXT'; 
    }





%%
