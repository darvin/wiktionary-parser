
%token  EXTENSION BEGINCOMMENT TEXT ENDCOMMENT OPENLINK OPENDBLSQBR CLOSEDBLSQBR PIPE NEWLINE PRELINE LISTBULLET LISTNUMBERED LISTIDENT HEADING ENDHEADING APO5 APO3 APO2 TABLEBEGIN TABLECELL TABLEHEAD TABLEROW TABLEEND TABLECAPTION ATTRIBUTE EQUALS ATTRAPO ATTRQ OPENPENTUPLECURLY CLOSEPENTUPLECURLY OPENTEMPLATEVAR CLOSETEMPLATEVAR OPENTEMPLATE CLOSETEMPLATE
/* LINKTRAIL OPENEXTERNALLINK CLOSEEXTERNALLINK PROTOCOL PROTOCOLSEP */
    
%start article

%%
/* rules */

    /* TODO:
        - optimise zeroormorenewlinessave (no need for Newlines nodes)
        - find all 'memcpy's and add a 'sizeof (char)' wherever necessary

       UNATTENDED-TO CAVEATS:
        - a row beginning with TABLEBEGIN but not containing valid table mark-up
          (e.g. "| Hah!" + NEWLINE) is turned into a paragraph of its own even
          if it and the next line are separated by only one newline (so they should
          all be one paragraph).
    */

article         :   /* empty */
                |   oneormorenewlines
                |   blocks
                ;

blocks          :   block
                |   blocks block
                ;

blocksintbl     :   blockintbl
                |   blocksintbl blockintbl
                ;

block           :   preblock
                |   heading zeroormorenewlines
                |   listblock zeroormorenewlines
                |   paragraph zeroormorenewlines
                |   table zeroormorenewlines
                |   comment zeroormorenewlines
                ;

blockintbl      :   preblock
                |   heading zeroormorenewlines
                |   listblock zeroormorenewlines
                |   paragraphintbl zeroormorenewlines
                |   table zeroormorenewlines
                |   comment zeroormorenewlines
                ;

heading         :   HEADING text ENDHEADING
                |   HEADING text  /* for eof */
                |   HEADING
                ;

preblock        :   preline
                |   preblock preline
                ;

preline         :   PRELINE textorempty zeroormorenewlinessave
                ;

listblock       :   bulletlistblock
                |   numberlistblock
                |   identlistblock
                ;

bulletlistblock :   bulletlistline
                |   bulletlistblock bulletlistline
                ;
numberlistblock :   numberlistline
                |   numberlistblock numberlistline
                ;
identlistblock  :   identlistline
                |   identlistblock identlistline
                ;

bulletlistline  :   LISTBULLET listseries textorempty NEWLINE
                |   LISTBULLET listseries textorempty
                ;
numberlistline  :   LISTNUMBERED listseries textorempty NEWLINE
                |   LISTNUMBERED listseries textorempty
                ;
identlistline   :   LISTIDENT listseries textorempty NEWLINE
                |   LISTIDENT listseries textorempty
                ;

listseries      :   /* empty */
                |   LISTBULLET
                |   LISTNUMBERED
                |   LISTIDENT
                |   listseries LISTBULLET
                |   listseries LISTNUMBERED
                |   listseries LISTIDENT
                ;



linktrail       : CLOSEDBLSQBR
                ;


/*|   externallink*/
linketc         :   OPENDBLSQBR textinlink linktrail
                |   OPENDBLSQBR textinlink PIPE linktrail
                |   OPENDBLSQBR textinlink pipeseries linktrail
                |   OPENDBLSQBR textinlink pipeseries PIPE linktrail
                |   OPENLINK textinlink linktrail
                |   OPENLINK textinlink PIPE linktrail
                |   OPENLINK textinlink pipeseries linktrail
                |   OPENLINK textinlink pipeseries PIPE linktrail
                    /* ... and now everything again with the CLOSEDBLSQBR missing,
                     * to take care of invalid mark-up. */
                |   OPENDBLSQBR textinlink
                |   OPENDBLSQBR textinlink PIPE
                |   OPENDBLSQBR textinlink pipeseries
                |   OPENDBLSQBR textinlink pipeseries PIPE
                |   OPENLINK textinlink
                |   OPENLINK textinlink PIPE
                |   OPENLINK textinlink pipeseries
                |   OPENLINK textinlink pipeseries PIPE
                ;


pipeseries      :   PIPE textinlink
                |   pipeseries PIPE textinlink
                ;

textorempty     :   /* empty */
                |   text
                ;

italicsorbold   :   APO2 textnoital APO2
                |   APO2 textnoital APO3 textnoboit APO5
                |   APO2 textnoital APO3 textnoboit
                |   APO2 textnoital
                |   APO3 textnobold APO3
                |   APO3 textnobold APO2 textnoboit APO5
                /* Peculiar case, especially for French l'''homme'' => l'<italics>homme</italics> */
                /* We have to use textnobold here, even though textnoital would be logical. */
                /* We use processNestedItalics to fix the weirdness produced by this. */
                |   APO3 textnobold APO2 textnoboit
                |   APO3 textnobold APO2
                |   APO3 textnobold
                |   APO5 textnoboit APO5
                |   APO5 textnoboit APO3 textnoital APO2
                |   APO5 textnoboit APO3 textnoital
                |   APO5 textnoboit APO3
                |   APO5 textnoboit APO2 textnobold APO3
                |   APO5 textnoboit APO2 textnobold
                |   APO5 textnoboit APO2
                |   APO5 textnoboit
                ;

italicsnobold   :   APO2 textnoboit APO2
                |   APO2 textnoboit
                ;

boldnoitalics   :   APO3 textnoboit APO3
                |   APO3 textnoboit
                ;

table           :   TABLEBEGIN attributes tablerows TABLEEND
                |   TABLEBEGIN attributes tablerows
                |   TABLEBEGIN attributes oneormorenewlines tablerows TABLEEND
                |   TABLEBEGIN attributes oneormorenewlines tablerows
                |   TABLEBEGIN tablerows TABLEEND
                |   TABLEBEGIN tablerows
                |   TABLEBEGIN oneormorenewlines tablerows TABLEEND
                |   TABLEBEGIN oneormorenewlines tablerows
                /* and now some invalid mark-up catering ... */
                |   TABLEBEGIN attributes zeroormorenewlines
                |   TABLEBEGIN attributes text zeroormorenewlines
                |   TABLEBEGIN text zeroormorenewlines
                |   TABLEBEGIN oneormorenewlines
                ;

tablerows       :   tablerow
                |   tablerows tablerow
                ;

tablerow        :   TABLEROW attributes tablecells
                |   TABLEROW tablecells
                |   TABLEROW attributes oneormorenewlines tablecells
                |   TABLEROW oneormorenewlines tablecells
                /* It is possible for the first table row to have no TABLEROW token */
                |   tablecells
                /* Some invalid mark-up catering... */
                |   TABLEROW attributes oneormorenewlines
                |   TABLEROW attributes
                |   TABLEROW oneormorenewlines
                |   TABLEROW
                |   tablecaption
                ;

tablecells      :   tablecell
                |   tablecells tablecell
                ;

tablecell       :   TABLECELL attributes PIPE tablecellcontents
                |   TABLECELL tablecellcontents
                |   TABLECELL attributes PIPE oneormorenewlines
                |   TABLECELL attributes PIPE
                |   TABLECELL oneormorenewlines
                |   TABLECELL
                |   TABLEHEAD attributes PIPE tablecellcontents
                |   TABLEHEAD tablecellcontents
                |   TABLEHEAD attributes PIPE oneormorenewlines
                |   TABLEHEAD attributes PIPE
                |   TABLEHEAD oneormorenewlines
                |   TABLEHEAD
                ;

tablecellcontents   :   blocksintbl
                    |   oneormorenewlines blocksintbl
                    ;

tablecaption    :   TABLECAPTION attributes PIPE textintbl
                |   TABLECAPTION attributes textintbl
                |   TABLECAPTION textintbl
                |   TABLECAPTION attributes PIPE
                |   TABLECAPTION attributes
                |   TABLECAPTION
                ;

/* In order to reduce the second one (ATTRIBUTE EQUALS TEXT) correctly, this rule must
 * be further up than textelement. */
attribute       :   ATTRIBUTE
                |   ATTRIBUTE EQUALS TEXT
                |   ATTRIBUTE EQUALS ATTRAPO text ATTRAPO
                |   ATTRIBUTE EQUALS ATTRQ text ATTRQ
                |   ATTRIBUTE EQUALS ATTRQ ATTRQ
                |   ATTRIBUTE EQUALS
                ;

attributes      :   attribute
                |   attributes attribute
                ;

text            :   textelement
                |   text textelement
                ;
textnoital      :   textelementnoital
                |   textnoital textelementnoital
                ;
textnobold      :   textelementnobold
                |   textnobold textelementnobold
                ;
textnoboit      :   textelementnoboit
                |   textnoboit textelementnoboit
                ;
textintbl       :   textelementintbl
                |   textintbl textelementintbl
                ;
textinlink      :   textelementinlink
                |   textinlink textelementinlink
                ;
textintmpl      :   textelementintmpl
                |   textintmpl textelementintmpl
                ;

textelement         :   TEXT
                    |   EXTENSION
                    |   PIPE
                    |   CLOSEDBLSQBR
                    |   APO2
                    |   APO3
                    |   APO5
                    |   EQUALS
                    |   TABLEBEGIN
                    |   TABLEEND
                    |   TABLEROW
                    |   TABLECELL
                    |   TABLEHEAD
                    |   TABLECAPTION
                    |   ATTRIBUTE
                    |   CLOSEPENTUPLECURLY
                    |   CLOSETEMPLATEVAR
                    |   CLOSETEMPLATE
                    |   comment
                    |   linketc
                    |   italicsorbold
                    |   template
                    |   templatevar
                    ;


textelementnoital   :   TEXT
                    |   EXTENSION
                    |   PIPE
                    |   CLOSEDBLSQBR
                    |   TABLEBEGIN
                    |   TABLEEND
                    |   TABLEROW
                    |   TABLECELL
                    |   TABLEHEAD
                    |   TABLECAPTION
                    |   ATTRIBUTE
                    |   CLOSEPENTUPLECURLY
                    |   CLOSETEMPLATEVAR
                    |   CLOSETEMPLATE
                    |   comment
                    |   linketc
                    |   boldnoitalics
                    |   template
                    |   templatevar
                    ;

textelementnobold   :   TEXT
                    |   EXTENSION
                    |   PIPE
                    |   CLOSEDBLSQBR
                    |   TABLEBEGIN
                    |   TABLEEND
                    |   TABLEROW
                    |   TABLECELL
                    |   TABLEHEAD
                    |   TABLECAPTION
                    |   ATTRIBUTE
                    |   CLOSEPENTUPLECURLY
                    |   CLOSETEMPLATEVAR
                    |   CLOSETEMPLATE
                    |   comment
                    |   linketc
                    |   italicsnobold
                    |   template
                    |   templatevar
                    ;

textelementnoboit   :   TEXT
                    |   EXTENSION
                    |   PIPE
                    |   CLOSEDBLSQBR
                    |   TABLEBEGIN
                    |   TABLEEND
                    |   TABLEROW
                    |   TABLECELL
                    |   TABLEHEAD
                    |   TABLECAPTION
                    |   ATTRIBUTE
                    |   CLOSEPENTUPLECURLY
                    |   CLOSETEMPLATEVAR
                    |   CLOSETEMPLATE
                    |   comment
                    |   linketc
                    |   template
                    |   templatevar
                    ;

textelementintbl    :   TEXT
                    |   EXTENSION
                    |   PIPE
                    |   CLOSEDBLSQBR
                    |   APO2
                    |   APO3
                    |   APO5
                    |   EQUALS
                    |   CLOSEPENTUPLECURLY
                    |   CLOSETEMPLATEVAR
                    |   CLOSETEMPLATE
                    |   comment
                    |   linketc
                    |   italicsorbold
                    |   template
                    |   templatevar
                    ;

textelementinlink   :   TEXT
                    |   EXTENSION
                    |   APO2
                    |   APO3
                    |   APO5
                    |   EQUALS
                    |   TABLEBEGIN
                    |   TABLEEND
                    |   TABLEROW
                    |   TABLECELL
                    |   TABLEHEAD
                    |   TABLECAPTION
                    |   ATTRIBUTE
                    |   CLOSEPENTUPLECURLY
                    |   CLOSETEMPLATEVAR
                    |   CLOSETEMPLATE
                    |   comment
                    |   linketc
                    |   italicsorbold
                    |   template
                    |   templatevar
                    ;

textelementintmpl   :   TEXT
                    |   EXTENSION
                    |   PIPE
                    |   CLOSEDBLSQBR
                    |   APO2
                    |   APO3
                    |   APO5
                    |   EQUALS
                    |   TABLEBEGIN
                    |   TABLEEND
                    |   TABLEROW
                    |   TABLECELL
                    |   TABLEHEAD
                    |   TABLECAPTION
                    |   ATTRIBUTE
                    |   comment
                    |   linketc
                    |   italicsorbold
                    |   template
                    |   templatevar
                    ;
/*
textinexternallink  :   TEXT
            |   CLOSEEXTERNALLINK
*/
template            :   OPENTEMPLATE textintmpl CLOSETEMPLATE
                    |   OPENPENTUPLECURLY textintmpl CLOSETEMPLATEVAR textintmpl CLOSETEMPLATE
                    |   OPENTEMPLATE textintmpl OPENTEMPLATEVAR textintmpl CLOSEPENTUPLECURLY
                    /* cater for invalid mark-up... */
                    |   OPENTEMPLATE textintmpl
                    |   OPENPENTUPLECURLY textintmpl CLOSETEMPLATEVAR textintmpl
                    |   OPENTEMPLATE textintmpl OPENTEMPLATEVAR textintmpl
                    ;

templatevar         :   OPENTEMPLATEVAR textintmpl CLOSETEMPLATEVAR
                    |   OPENPENTUPLECURLY textintmpl CLOSEPENTUPLECURLY
                    /* cater for invalid mark-up... */
                    |   OPENTEMPLATEVAR textintmpl
                    |   OPENPENTUPLECURLY textintmpl
                    ;

zeroormorenewlines  :   /* empty */
                    |   oneormorenewlines
                    ;
oneormorenewlines   :   NEWLINE
                    |   oneormorenewlines NEWLINE
                    ;

zeroormorenewlinessave  :   /* empty */
                        |   oneormorenewlinessave
                        ;
oneormorenewlinessave   :   NEWLINE
                        |   oneormorenewlinessave NEWLINE
                        ;

paragraph       :   text NEWLINE
                |   paragraph text NEWLINE
                /* for eof ... */
                |   text
                |   paragraph text
                ;

/* This seemingly pointless inclusion of 'attributes' here that will all be converted to text
 * by way of convertAttributesToText() is necessary because, as a table cell begins, we simply
 * don't know whether there are attributes following or not. We parse them as attributes first,
 * but then convert them back to text if it turns out they're not. */
paragraphintbl  :   textintbl NEWLINE
                |   attributes textintbl NEWLINE
                |   attributes NEWLINE
                |   paragraphintbl textintbl NEWLINE
                |   paragraphintbl attributes textintbl NEWLINE
                |   paragraphintbl attributes NEWLINE
                /* for eof ... */
                |   textintbl
                |   attributes textintbl
                |   attributes
                |   paragraphintbl textintbl
                |   paragraphintbl attributes textintbl
                |   paragraphintbl attributes
                ;

comment         :   BEGINCOMMENT text ENDCOMMENT
                |   BEGINCOMMENT ENDCOMMENT
                ;


%%
