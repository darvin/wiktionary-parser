
/* General */

digit        
    : ("1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"0");
URL          
    : ASCII_letter "://" URL_char;
ASCII_letter 
    : ("a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m"
                | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
                | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M"
                | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z");
URL_char     
    : (ASCII letter | digit | "-" | "_" | "." | "~" | "!" | "*" | "'" | "(" | ")" | ";"
                | ":" | "@" | "&" | "=" | "+" | "$" | "," | "/" | "?" | "%" | "#" | "[" | "]");
Unicode_char 
    : /* Assume this is all valid Unicode characters. */;
text         
    : { Unicode_char };

full_pagename
    : [ namespace, ":" | ":" ] pagename;
namespace    
    : Unicode_char, { Unicode_char };
pagename     
    : Unicode_char, { Unicode_char };


/*  Links  */

start_link   
    : "[[";
end_link     
    : "]]";
internal_link
    : start_link, full_pagename, ["|", label], end_link, label_extension;
external_link
    : URL | (start_link, URL, [whitespace Label], endLink, label_extension);
redirect     
    : "#REDIRECT", internal_link;
header_link  
    : "/*", text, "*/";
ISBN_link    
    : digit, ["-"|" "], 3 * digit, ["-"|" "], 5 * digit,
                [("-"|" "),(digit|"X"|"x")];


/*  Headers  */

header_end 
    : [whitespace], line_break;
header6    
    : line break, "======", [whitespace], text, [whitespace], "======", header_end;
header5    
    : line break, "=====",  [whitespace], text, [whitespace], "=====",  header_end;
header4    
    : line break, "====",   [whitespace], text, [whitespace], "====",   header_end;
header3    
    : line break, "===",    [whitespace], text, [whitespace], "===",    header_end;
header2    
    : line break, "==",     [whitespace], text, [whitespace], "==",     header_end;
header1    
    : line break, "=",      [whitespace], text, [whitespace], "=",      header_end;
comment    
    : "<!--", [Text], "-->";
Commentary 
    : "<comment", [Text], ">", [Text], "</comment>"; /* This works? */


/*  Formatting  */

horizontal_rule 
    : "----", {"-"};
bold_italic_text
    : "'''''", text, "'''''";
bold_text       
    : "'''", text, "'''"; 
italic_text     
    : "''", text, "''";
code_line       
    : linebreak, " ", text;
nowiki          
    : "&lt;nowiki&gt;", text, "&lt;/nowiki&gt;";


/*  Lists  */

unordered_list          
    : "*", text;
continue_unordered_list 
    : (unordered_list|continue_unordered_list|":"|"*"|"#"),
                           linebreak, unordered_list;
ordered_list            
    : "#", text;
continue_ordered_list   
    : (ordered_list|continue_ordered_list|":"|"*"|"#"),
                           linebreak, ordered_list;
definition_list         
    : [text], ":", text;
continue_definition_list
    : (definition_list|continue_definition_list|":"|"*"|"#"),
                           linebreak, definition_list;


/*  Signature  */

user_signature          
    : "~~~";
user_signature_with_date
    : "~~~~";
current_date            
    : "~~~~~";


/*  Includes  */

include 
    : ( template | tplarg ) ;
template
    : "{{", title, { "|", part }, "}}" ;
tplarg  
    : "{{{", title, { "|", part }, "}}}" ;
part    
    : [ name, "=" ], value ;    
title   
    : balanced_text ;
name    
    : balanced_text ;
value   
    : balanced_text ;
balanced_text
    : text_without_consecutive_equal_braces, { include, text_without_consecutive_equal_braces } ;


/* Behavior switches */

place_TOC           
    : {whitespace|linebreak}, "__TOC__",           {whitespace|linebreak};
force_TOC           
    : {whitespace|linebreak}, "__FORCETOC__",      {whitespace|linebreak};
disable_TOC         
    : {whitespace|linebreak}, "__NOTOC__",         {whitespace|linebreak};
disable_section_edit
    : {whitespace|linebreak}, "__NOEDITSECTION__", {whitespace|linebreak};


/* Tables */

table_start      
    : "{|", {style|whitespace}, linebreak;
table_end        
    : "|}";
table_header     
    : "|+", text, linebreak; /* What is this?  This exists? */
table_header_cell
    : (linebreak, "!", ({style|whitespace}- "|"), text)
                  | (tablecell, ("!!" | "||"), ({style|whitespace}- "|"), text);
table_cell       
    : (linebreak, "|", ({style|whitespace}- "|"), text)
                  | (table_cell, "||", ({Style|WhiteSpace}- "|"), text);
table_row        
    : linebreak, "|-", {"-"}, {style|whitespace}, linebreak;

table_body       
    : ( table_header_cell | table_cell ),
                    { table_row, ( table_header_cell | table cell ) };
table            
    : table_start, [table_row], table_body, table_end;
