(function(t){function e(e){for(var i,r,c=e[0],s=e[1],l=e[2],d=0,_=[];d<c.length;d++)r=c[d],Object.prototype.hasOwnProperty.call(a,r)&&a[r]&&_.push(a[r][0]),a[r]=0;for(i in s)Object.prototype.hasOwnProperty.call(s,i)&&(t[i]=s[i]);u&&u(e);while(_.length)_.shift()();return o.push.apply(o,l||[]),n()}function n(){for(var t,e=0;e<o.length;e++){for(var n=o[e],i=!0,c=1;c<n.length;c++){var s=n[c];0!==a[s]&&(i=!1)}i&&(o.splice(e--,1),t=r(r.s=n[0]))}return t}var i={},a={app:0},o=[];function r(e){if(i[e])return i[e].exports;var n=i[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=t,r.c=i,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/";var c=window["webpackJsonp"]=window["webpackJsonp"]||[],s=c.push.bind(c);c.push=e,c=c.slice();for(var l=0;l<c.length;l++)e(c[l]);var u=s;o.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"04a9":function(t,e,n){},"08cf":function(t,e,n){},"099d":function(t,e,n){},"0d0b":function(t,e,n){"use strict";var i=n("4de2"),a=n.n(i);a.a},"136c":function(t,e,n){t.exports=n.p+"img/logo.ae432409.svg"},"2c91":function(t,e,n){},"32ff":function(t,e,n){},"33a9":function(t,e,n){"use strict";var i=n("74e6"),a=n.n(i);a.a},3767:function(t,e,n){"use strict";var i=n("2c91"),a=n.n(i);a.a},4935:function(t,e,n){"use strict";var i=n("04a9"),a=n.n(i);a.a},"4de2":function(t,e,n){},5567:function(t,e,n){},"56d7":function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var i=n("2b0e"),a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"app"}},[n("AppTemplate")],1)},o=[],r=(n("28a9"),function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"template"},[i("nav",[i("img",{staticClass:"logo",attrs:{src:n("136c"),alt:"logo"}}),i("router-link",{attrs:{to:"/"}},[t._v("All articles")]),t._l(t.$store.state.navigation_items,(function(e){return i("router-link",{key:e.identity.low,attrs:{to:{name:"tag",query:{id:e.identity.low}}}},[t._v(" "+t._s(e.properties.name)+" ")])}))],2),i("main",[i("router-view")],1)])}),c=[],s={name:"Template",props:{navigation:{type:Array}}},l=s,u=(n("0d0b"),n("2877")),d=Object(u["a"])(l,r,c,!1,null,null,null),_=d.exports,p={name:"App",components:{AppTemplate:_},data:function(){return{navigation:[{route:"/",icon:"",label:"All articles"}]}},mounted:function(){this.$store.commit("check_authentication"),this.$store.commit("update_categories")}},f=p,g=Object(u["a"])(f,a,o,!1,null,null,null),m=g.exports,h=n("8c4f"),v=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"container"},[t.article?n("Toolbar",[n("div",{staticClass:"dates_container"},[t.article.properties.creation_date?n("div",{},[t._v("Created: "+t._s(t.format_date(t.article.properties.creation_date)))]):t._e(),t.article.properties.edition_date?n("div",{},[t._v("Edited: "+t._s(t.format_date(t.article.properties.edition_date)))]):t._e()]),t.article.properties.published&&t.$store.state.logged_in?n("div",{staticClass:"published_indicator"},[n("earth-icon",{staticClass:"publishing_status"}),n("span",[t._v("Published")])],1):t._e(),n("div",{staticClass:"tags_wrapper"},[n("span",[t._v("Tags: ")]),t._l(t.tags,(function(t){return n("Tag",{key:t.identity.low,attrs:{tag:t}})}))],2),n("div",{staticClass:"growing_spacer"}),n("IconButton",{on:{click:function(e){return t.$router.push({name:"article_list"})}}},[n("arrow-left-icon")],1),t.$store.state.logged_in?n("IconButton",{on:{click:function(e){return t.download_as_html_file()}}},[n("download-icon")],1):t._e(),t.$store.state.logged_in&&t.$route.query.id?n("IconButton",{on:{click:function(e){return t.$router.push({path:"article_editor",query:{id:t.article.identity.low}})}}},[n("pencil-icon")],1):t._e(),t.$store.state.logged_in?n("IconButton",{on:{buttonClicked:function(e){return t.$router.push({path:"article_editor"})}}},[n("plus-icon")],1):t._e()],1):t._e(),t.article?n("article",{ref:"article_content",domProps:{innerHTML:t._s(t.article.properties.content)}}):t.loading?n("Loader"):n("div",[t._v("Article not found")]),n("Modal",{attrs:{open:t.modal.open},on:{close:function(e){t.modal.open=!1}}},[n("img",{staticClass:"modal_image",attrs:{src:t.modal.image_src,alt:""}})])],1)},b=[],y=(n("d3b7"),n("3ca3"),n("159b"),n("ddb0"),n("2b3d"),function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("button",{staticClass:"icon_button",class:{active:t.active},style:{fontSize:t.size},attrs:{type:"button"},on:{click:function(e){return t.button_clicked()}}},[t._t("default")],2)}),w=[],k={name:"IconButton",props:{size:{type:String,default:function(){return"100%"}},active:{type:Boolean,default:function(){return!1}}},methods:{button_clicked:function(){this.$emit("click"),this.$emit("buttonClicked")}}},I=k,x=(n("f869"),Object(u["a"])(I,y,w,!1,null,"644432b8",null)),$=x.exports,C=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"modal",class:{open:t.open},on:{click:function(e){return e.target!==e.currentTarget?null:t.$emit("close")}}},[n("div",{staticClass:"modal_window_outer"},[n("div",{staticClass:"modal_window_inner"},[t.close_button?n("span",{staticClass:"modal_close_button mdi mdi-close",on:{click:function(e){return e.target!==e.currentTarget?null:t.$emit("close")}}}):t._e(),t._t("default")],2)])])},B=[],j={name:"Modal",props:{open:Boolean,close_button:{type:Boolean,default:!0}}},T=j,E=(n("a851"),Object(u["a"])(T,C,B,!1,null,"0ba7d709",null)),L=E.exports,O=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"toolbar"},[t._t("default")],2)},P=[],A={name:"Toolbar"},q=A,M=(n("f00f"),Object(u["a"])(q,O,P,!1,null,"5892c8a7",null)),S=M.exports,F=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},D=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"loader"},[n("div",{staticClass:"spinner"})])}],H={name:"Loader"},N=H,U=(n("bf8a"),Object(u["a"])(N,F,D,!1,null,"7c3a0e35",null)),R=U.exports,z=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("span",{staticClass:"tag",on:{click:function(e){return e.stopPropagation(),t.tag_clicked()}}},[t.tag?n("span",[t._v(t._s(t.tag.properties.name))]):n("span",[t._v("Invalid tag")]),t.removable?n("span",{staticClass:"remove_button",on:{click:function(e){return e.stopPropagation(),t.$emit("remove")}}},[t._v("×")]):t._e()])},J=[],W=(n("b0c0"),{name:"Tag",props:{tag:{type:Object},removable:{type:Boolean,default:function(){return!1}},cickable:{type:Boolean,default:function(){return!1}}},methods:{tag_clicked:function(){"tag"===this.$route.name&&this.$route.query.id===this.tag.identity.low||this.$router.push({name:"tag",query:{id:this.tag.identity.low}})}}}),Q=W,G=(n("dd92"),Object(u["a"])(Q,z,J,!1,null,"ce8e08bc",null)),K=G.exports,V=(n("a15b"),{methods:{format_date:function(t){var e=t.month.low,n=t.day.low;return[t.year.low,(e>9?"":"0")+e,(n>9?"":"0")+n].join("/")}}}),X=n("1487"),Y=n.n(X),Z=n("57e5"),tt=n("17a2"),et=n("d902"),nt=n("bb79"),it=n("758f"),at={components:{IconButton:$,Modal:L,Toolbar:S,Loader:R,Tag:K,EarthIcon:tt["a"],ArrowLeftIcon:Z["a"],PencilIcon:et["a"],DownloadIcon:nt["a"],PlusIcon:it["a"]},mixins:[V],data:function(){return{article:null,tags:[],loading:!1,modal:{open:!1,image_src:""}}},mounted:function(){this.get_content()},methods:{get_content:function(){var t=this;"id"in this.$route.query&&(this.loading=!0,this.axios.post("https://cms.maximemoreillon.com/get_article_neo4j",{id:this.$route.query.id}).then((function(e){t.loading=!1,t.article=e.data[0]._fields[e.data[0]._fieldLookup["article"]],setTimeout(t.add_event_listeners_for_image_modals,100),setTimeout((function(){document.querySelectorAll("pre code").forEach((function(t){Y.a.highlightBlock(t)}))}),10),e.data.forEach((function(e){var n=e._fields[e._fieldLookup["tag"]];n&&t.tags.push(n)}))})).catch((function(t){return alert(t)})))},add_event_listeners_for_image_modals:function(){var t=this;this.$refs.article_content.querySelectorAll("img").forEach((function(e){e.addEventListener("click",(function(e){t.modal.open=!0,t.modal.image_src=e.target.src}),!1)}))},download_as_html_file:function(){var t=window.document.createElement("a");t.href=window.URL.createObjectURL(new Blob([this.article.content],{type:"text/html"})),t.download="test.html",document.body.appendChild(t),t.click(),document.body.removeChild(t)}}},ot=at,rt=(n("4935"),Object(u["a"])(ot,v,b,!1,null,null,null)),ct=rt.exports,st=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"article_editor_view"},[t.$store.state.logged_in&&!t.article_loading?n("div",{staticClass:"authentication_wrapper"},[n("Toolbar",[n("div",{staticClass:"dates_container"},[t.article.properties.creation_date?n("div",{},[t._v("Created on "+t._s(t.format_date(t.article.properties.creation_date)))]):t._e(),t.article.properties.edition_date?n("div",{},[t._v("Last edited on "+t._s(t.format_date(t.article.properties.edition_date)))]):t._e()]),t._e(),n("div",{staticClass:"growing_spacer"}),t.$route.query.id?n("IconButton",{on:{click:function(e){return t.$router.push({name:"article",query:{id:t.$route.query.id}})}}},[n("arrow-left-icon")],1):n("IconButton",{on:{click:function(e){return t.$router.push({name:"article_list"})}}},[n("arrow-left-icon")],1),n("IconButton",{attrs:{active:t.editable},on:{click:function(e){t.editable=!t.editable}}},[n("pencil-icon")],1),n("IconButton",{on:{click:function(e){return t.submit_article()}}},[n("content-save-icon")],1),n("IconButton",{on:{click:function(e){return t.delete_article()}}},[n("delete-icon")],1),n("IconButton",{attrs:{active:t.article.properties.published},on:{click:function(e){return t.toggle_published()}}},[n("earth-icon")],1)],1),n("div",{staticClass:"tags_wrapper"},[n("label",{attrs:{for:"tag_search"}},[t._v("Tags: ")]),t._l(t.tags,(function(e,i){return n("Tag",{key:e.identity.low,attrs:{tag:e,removable:""},on:{remove:function(e){return t.delete_tag(i)}}})})),n("input",{ref:"tag_input",attrs:{id:"tag_search",type:"search",list:"existing_tag_list"},on:{keyup:[function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.add_tag()},function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"delete",[8,46],e.key,["Backspace","Delete","Del"])?null:t.delete_last_Tag()}]}}),n("datalist",{attrs:{id:"existing_tag_list"}},t._l(t.existing_tags,(function(t){return n("option",{key:t.identity.low,domProps:{value:t.properties.name}})})),0)],2),n("div",{staticClass:"editor_wrapper"},[n("editor-menu-bar",{attrs:{editor:t.editor},scopedSlots:t._u([{key:"default",fn:function(e){var i=e.commands,a=e.isActive;e.getMarkAttrs;return[n("div",{staticClass:"menubar"},[n("IconButton",{attrs:{active:a.bold()},on:{click:i.bold}},[n("format-bold-icon")],1),n("IconButton",{attrs:{active:a.italic()},on:{click:i.italic}},[n("format-italic-icon")],1),n("IconButton",{attrs:{active:a.strike()},on:{click:i.strike}},[n("format-strikethrough-icon")],1),n("IconButton",{attrs:{active:a.underline()},on:{click:i.underline}},[n("format-underline-icon")],1),n("IconButton",{attrs:{active:a.code()},on:{click:i.code}},[n("code-tags-icon")],1),n("IconButton",{attrs:{active:a.paragraph()},on:{click:i.paragraph}},[n("format-paragraph-icon")],1),n("IconButton",{attrs:{active:a.heading({level:1})},on:{click:function(t){return i.heading({level:1})}}},[n("format-header-1-icon")],1),n("IconButton",{attrs:{active:a.heading({level:2})},on:{click:function(t){return i.heading({level:2})}}},[n("format-header-2-icon")],1),n("IconButton",{attrs:{active:a.heading({level:3})},on:{click:function(t){return i.heading({level:3})}}},[n("format-header-3-icon")],1),n("IconButton",{attrs:{active:a.bullet_list()},on:{click:i.bullet_list}},[n("format-list-bulleted-icon")],1),n("IconButton",{attrs:{active:a.ordered_list()},on:{click:i.ordered_list}},[n("format-list-numbered-icon")],1),n("IconButton",{attrs:{active:a.blockquote()},on:{click:i.blockquote}},[n("format-quote-close-icon")],1),n("IconButton",{attrs:{active:a.code_block()},on:{click:i.code_block}},[n("code-tags-icon")],1),n("IconButton",{on:{click:i.undo}},[n("undo-icon")],1),n("IconButton",{on:{click:i.redo}},[n("redo-icon")],1),n("IconButton",{on:{click:function(e){return t.showImagePrompt(i.image)}}},[n("image-icon")],1),n("IconButton",{staticClass:"menubar_button",class:{"is-active":a.link()},on:{click:function(e){return t.prompt_for_url(i.link)}}},[n("link-icon")],1)],1)]}}],null,!1,1495954819)}),n("div",{staticClass:"editor"},[n("editor-content",{staticClass:"editor_content",attrs:{editor:t.editor}})],1)],1)],1):t._e(),t.$store.state.logged_in&&t.article_loading?n("Loader"):t._e(),t.$store.state.logged_in?t._e():n("div",{},[t._v(" Articles cannot be edited by unauthenticated user ")])],1)},lt=[],ut=(n("a434"),n("cd42")),dt=n("f23d"),_t=n("d4ec"),pt=n("bee2"),ft=n("99de"),gt=n("7e84"),mt=n("262e"),ht=function(t){function e(){return Object(_t["a"])(this,e),Object(ft["a"])(this,Object(gt["a"])(e).apply(this,arguments))}return Object(mt["a"])(e,t),Object(pt["a"])(e,[{key:"name",get:function(){return"iframe"}},{key:"schema",get:function(){return{attrs:{src:{default:null}},group:"block",selectable:!1,parseDOM:[{tag:"iframe",getAttrs:function(t){return{src:t.getAttribute("src")}}}],toDOM:function(t){return["iframe",{src:t.attrs.src,frameborder:0,allowfullscreen:"true"}]}}}},{key:"view",get:function(){return{props:["node","updateAttrs","view"],computed:{src:{get:function(){return this.node.attrs.src},set:function(t){this.updateAttrs({src:t})}}},template:'\n        <div class="iframe">\n          <iframe class="iframe__embed" :src="src"></iframe>\n          <input class="iframe__input" @paste.stop type="text" v-model="src" v-if="view.editable" />\n        </div>\n      '}}}]),e}(ut["f"]),vt=n("4dd1"),bt=n.n(vt),yt=n("ee8c"),wt=n.n(yt),kt=n("f0f8"),It=n.n(kt),xt=n("9510"),$t=n.n(xt),Ct=n("b65b"),Bt=n.n(Ct),jt=n("44b5"),Tt=n.n(jt),Et=n("0209"),Lt=n.n(Et),Ot=n("8dcb"),Pt=n.n(Ot),At=n("0647"),qt=n("0fc3"),Mt=n("fa90"),St=n("c55d"),Ft=n("2672"),Dt=n("b53f"),Ht=n("0119"),Nt=n("b00a"),Ut=n("aca8"),Rt=n("c756"),zt=n("3610"),Jt=n("0148"),Wt=n("ddd9"),Qt=n("3048"),Gt=n("1a4c"),Kt=n("16f7"),Vt=n("7143"),Xt=n("ad93"),Yt={components:{Toolbar:S,Loader:R,Tag:K,IconButton:$,EditorContent:ut["b"],EditorMenuBar:ut["c"],ArrowLeftIcon:Z["a"],DeleteIcon:At["a"],ContentSaveIcon:qt["a"],EarthIcon:tt["a"],CodeTagsIcon:Mt["a"],FormatHeader1Icon:St["a"],FormatHeader2Icon:Ft["a"],FormatHeader3Icon:Dt["a"],FormatBoldIcon:Nt["a"],FormatItalicIcon:Ut["a"],FormatStrikethroughIcon:Rt["a"],FormatUnderlineIcon:zt["a"],FormatParagraphIcon:Ht["a"],FormatListBulletedIcon:Jt["a"],FormatListNumberedIcon:Wt["a"],FormatQuoteCloseIcon:Qt["a"],UndoIcon:Gt["a"],RedoIcon:Kt["a"],LinkIcon:Vt["a"],PencilIcon:et["a"],ImageIcon:Xt["a"]},mixins:[V],data:function(){var t=this;return{editor:new ut["a"]({extensions:[new dt["a"],new dt["c"],new dt["e"],new dt["g"],new dt["h"]({levels:[1,2,3]}),new dt["j"],new dt["n"],new dt["o"],new dt["r"],new dt["s"],new dt["m"],new dt["b"],new dt["d"],new dt["l"],new dt["q"],new dt["t"],new dt["i"],new dt["k"],new dt["p"]({emptyEditorClass:"is-editor-empty",emptyNodeClass:"is-empty",emptyNodeText:"Write something …",showOnlyWhenEditable:!0,showOnlyCurrent:!0}),new dt["f"]({languages:{javascript:bt.a,css:wt.a,shell:Bt.a,python:$t.a,bash:It.a,dockerfile:Tt.a,cpp:Lt.a,xml:Pt.a}}),new ht],editable:!0,content:"",onUpdate:function(e){var n=e.getHTML;t.article.properties.content=n(),t.set_article_title(),t.set_article_summary(),t.set_article_thumbnail_src()}}),article:{identity:{low:void 0},properties:{content:null,published:!1,title:"",summary:"",thumbnail_src:""}},tags:[],editable:!0,article_loading:!0,existing_tags:[]}},watch:{editable:function(){this.editor.setOptions({editable:this.editable})}},mounted:function(){this.get_article_if_exists(),this.get_existing_tags()},beforeDestroy:function(){this.editor.destroy()},methods:{get_article_if_exists:function(){var t=this;"id"in this.$route.query?(this.article_loading=!0,this.axios.post("https://cms.maximemoreillon.com/get_article_neo4j",{id:this.$route.query.id}).then((function(e){t.article=e.data[0]._fields[e.data[0]._fieldLookup["article"]],t.editor.setContent(t.article.properties.content),e.data.forEach((function(e){var n=e._fields[e._fieldLookup["tag"]];n&&t.tags.push(n)})),t.article_loading=!1})).catch((function(t){return alert(t)}))):this.article_loading=!1},toggle_published:function(){this.article.properties.published=!this.article.properties.published},submit_article:function(){var t=this;this.article_loading=!0,this.article.identity.low?this.axios.post("https://cms.maximemoreillon.com/update_article_neo4j",{article:this.article,tags:this.tags}).then((function(e){t.article_loading=!1;var n=e.data[0]._fields[e.data[0]._fieldLookup["article"]].identity.low;t.$router.push({name:"article",query:{id:n}})})).catch((function(t){return console.log(t.response.data)})):this.axios.post("https://cms.maximemoreillon.com/create_article_neo4j",{article:this.article,tags:this.tags}).then((function(e){t.article_loading=!1;var n=e.data[0]._fields[e.data[0]._fieldLookup["article"]].identity.low;t.$router.push({name:"article",query:{id:n}})})).catch((function(t){return console.log(t.response.data)}))},delete_article:function(){var t=this;confirm("Delete article?")&&(this.article_loading=!0,this.axios.post("https://cms.maximemoreillon.com/delete_article_neo4j",{id:this.article.identity.low}).then((function(){t.article_loading=!1,t.$router.push({name:"article_list"})})).catch((function(t){return alert(t)})))},add_tag:function(){var t=this;this.axios.post("https://cms.maximemoreillon.com/create_tag_neo4j",{tag_name:this.$refs.tag_input.value}).then((function(e){var n=e.data[0]._fields[e.data[0]._fieldLookup["tag"]];t.tags.push(n)})).catch((function(t){return console.log(t.response.data)})),this.$refs.tag_input.value=""},delete_tag:function(t){this.tags.splice(t,1)},delete_last_Tag:function(){},get_existing_tags:function(){var t=this;this.axios.post("https://cms.maximemoreillon.com/get_tag_list_neo4j",{}).then((function(e){t.existing_tags.splice(0,t.existing_tags.length),e.data.forEach((function(e){var n=e._fields[e._fieldLookup["tag"]];t.existing_tags.push(n)}))})).catch((function(t){return alert(t)}))},set_article_title:function(){var t=document.createElement("div");t.innerHTML=this.article.properties.content;var e=t.getElementsByTagName("h1")[0];e&&(this.article.properties.title=e.innerHTML)},set_article_summary:function(){var t=document.createElement("div");t.innerHTML=this.article.properties.content;var e=t.getElementsByTagName("p")[0];e&&(this.article.properties.summary=e.innerHTML)},set_article_thumbnail_src:function(){var t=document.createElement("div");t.innerHTML=this.article.properties.content;var e=t.getElementsByTagName("img")[0];e&&(this.article.properties.thumbnail_src=e.src)},prompt_for_url:function(t){var e=prompt("URL:");e&&t({href:e})},showImagePrompt:function(t){var e=prompt("Enter the url of your image here");e&&t({src:e})},parse_file:function(t){var e=this,n=t.srcElement.files[0],i=new FileReader;i.onload=function(t){return e.article.content=t.target.result},i.onerror=function(t){return console.log(t)},i.readAsText(n)}}},Zt=Yt,te=(n("b545"),Object(u["a"])(Zt,st,lt,!1,null,null,null)),ee=te.exports,ne=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"article_list_view"},[n("Toolbar",[n("div",{staticClass:"growing_spacer"}),t.$store.state.logged_in?n("IconButton",{on:{buttonClicked:function(e){return t.$router.push({path:"article_editor"})}}},[n("plus-icon")],1):t._e()],1),t.articles_loading?n("Loader"):n("div",{staticClass:"articles_container"},t._l(t.articles,(function(t,e){return n("ArticlePreview",{key:e,attrs:{article:t}})})),1)],1)},ie=[],ae=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"article_preview",on:{click:function(e){return t.$router.push({path:"article",query:{id:t.article.identity.low}})}}},[t.article.properties.published&&t.$store.state.logged_in?n("earth-icon",{staticClass:"publishing_status"}):t._e(),n("div",{staticClass:"article_title"},[t._v(t._s(t.article.properties.title))]),t.article.properties.creation_date?n("div",{staticClass:"article_metadata"},[n("span",{staticClass:"article_date"},[t._v(t._s(t.format_date(t.article.properties.creation_date)))])]):t._e(),t.article.properties.thumbnail_src?n("img",{staticClass:"article_thumbnail",attrs:{src:t.article.properties.thumbnail_src,alt:""}}):t._e(),t.article.properties.summary?n("div",{staticClass:"article_summary",domProps:{innerHTML:t._s(t.article.properties.summary)}}):t._e(),t.tags&&!t.tags_loading?n("div",{staticClass:"tags_container"},t._l(t.tags,(function(t){return n("Tag",{key:t.identity.low,attrs:{tag:t}})})),1):t.tags_loading?n("Loader"):n("div",{},[t._v(" No tags ")])],1)},oe=[],re={name:"ArticlePreview",props:{article:Object},data:function(){return{tags:[],tags_loading:!1}},mixins:[V],components:{Tag:K,Loader:R,EarthIcon:tt["a"]},mounted:function(){this.get_tags()},methods:{get_tags:function(){var t=this;this.tags_loading=!0,this.axios.post("https://cms.maximemoreillon.com/get_tags_of_article",{id:this.article.identity.low}).then((function(e){t.tags.splice(0,t.tags.length),e.data.forEach((function(e){var n=e._fields[e._fieldLookup["tag"]];t.tags.push(n)})),t.tags_loading=!1})).catch((function(t){console.log(t.response.data)}))}}},ce=re,se=(n("33a9"),Object(u["a"])(ce,ae,oe,!1,null,"b59d52f6",null)),le=se.exports,ue={components:{IconButton:$,ArticlePreview:le,Toolbar:S,Loader:R,PlusIcon:it["a"]},data:function(){return{articles:[],articles_loading:!1}},methods:{get_articles:function(){var t=this;this.articles_loading=!0,this.articles.splice(0,this.articles.length),this.axios.post("https://cms.maximemoreillon.com/get_article_list_neo4j",{sort:{direction:"DESC"}}).then((function(e){e.data.forEach((function(e){var n=e._fields[e._fieldLookup["article"]];t.articles.push(n)})),t.articles_loading=!1})).catch((function(t){console.log(t.response.data)}))}},mounted:function(){this.get_articles()}},de=ue,_e=(n("3767"),Object(u["a"])(de,ne,ie,!1,null,"169c642c",null)),pe=_e.exports,fe=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"tag_view"},[t.tag&&!t.loading?n("div",{staticClass:"wrapper"},[n("div",{staticClass:"tag_wrapper"},[n("Tag",{attrs:{tag:t.tag}}),t.$store.state.logged_in?n("IconButton",{on:{click:function(e){return t.prompt_for_rename()}}},[n("pencil-icon")],1):t._e(),t.$store.state.logged_in?n("IconButton",{on:{click:function(e){return t.delete_tag()}}},[n("delete-icon")],1):t._e(),t.$store.state.logged_in?n("IconButton",{attrs:{active:t.tag.properties.navigation_item},on:{click:function(e){return t.toggle_navigation_item()}}},[n("pin-icon")],1):t._e(),t.$store.state.logged_in?n("IconButton",{on:{buttonClicked:function(e){return t.$router.push({path:"article_editor"})}}},[n("plus-icon")],1):t._e()],1)]):t.loading?n("Loader"):n("div",{},[t._v(" Tag not found ")]),t.articles.length>0&&!t.articles_loading?n("div",{staticClass:"articles_wrapper"},[n("div",{},[t._v(" Articles with this tag ("+t._s(t.articles.length)+"): ")]),n("div",{staticClass:"articles_container"},t._l(t.articles,(function(t){return n("ArticlePreview",{key:t.identity.low,attrs:{article:t}})})),1)]):t.loading?n("Loader"):n("div",{},[t._v(" No article with this tag ")])],1)},ge=[],me=n("d410"),he={components:{Loader:R,Tag:K,ArticlePreview:le,IconButton:$,DeleteIcon:At["a"],PencilIcon:et["a"],PinIcon:me["a"],PlusIcon:it["a"]},data:function(){return{loading:!1,tag:null,articles:[],articles_loading:!1}},mounted:function(){this.get_tag(this.$route.query.id)},beforeRouteUpdate:function(t,e,n){this.get_tag(t.query.id),n()},methods:{get_tag:function(t){var e=this;this.tag=null,"id"in this.$route.query&&(this.loading=!0,this.articles.splice(0,this.articles.length),this.axios.post("https://cms.maximemoreillon.com/get_tag_neo4j",{id:t}).then((function(t){if(e.loading=!1,t.data.length>0){var n=t.data[0];e.tag=n._fields[n._fieldLookup["tag"]],e.get_articles_of_tag(e.tag.identity.low)}})).catch((function(t){return console.log(t.response.data)})))},get_articles_of_tag:function(t){var e=this;this.articles_loading=!0,this.axios.post("https://cms.maximemoreillon.com/get_articles_of_tag",{id:t}).then((function(t){e.articles.splice(0,e.articles.length),t.data.forEach((function(t){var n=t._fields[t._fieldLookup["article"]];e.articles.push(n)})),e.articles_loading=!1})).catch((function(t){return console.log(t.response.data)}))},update_tag:function(){var t=this;"id"in this.$route.query&&(this.loading=!0,this.axios.post("https://cms.maximemoreillon.com/update_tag_neo4j",{tag:this.tag}).then((function(){t.get_tag(t.$route.query.id),t.$store.commit("update_categories")})).catch((function(t){return alert(t)})))},prompt_for_rename:function(){var t=prompt("New tag name",this.tag.properties.name);t&&(this.tag.properties.name=t,this.update_tag())},toggle_navigation_item:function(){this.tag.properties.navigation_item=!this.tag.properties.navigation_item,this.update_tag()},delete_tag:function(){var t=this;confirm("Delete tag?")&&(this.article_loading=!0,this.axios.post("https://cms.maximemoreillon.com/delete_tag_neo4j",{id:this.tag.identity.low}).then((function(){t.$router.push({name:"article_list"})})).catch((function(t){return alert(t)})))}}},ve=he,be=(n("6f16"),Object(u["a"])(ve,fe,ge,!1,null,"7f7b760c",null)),ye=be.exports;i["a"].use(h["a"]);var we=[{path:"/",name:"article_list",component:pe},{path:"/article",name:"article",component:ct,props:!0},{path:"/article_editor",name:"article_editor",component:ee,props:!0},{path:"/tag",name:"tag",component:ye}],ke=new h["a"]({mode:"history",base:"/",routes:we}),Ie=ke,xe=n("2f62"),$e=n("bc3a"),Ce=n.n($e);i["a"].use(xe["a"]);var Be=new xe["a"].Store({state:{logged_in:!1,navigation_items:[]},mutations:{check_authentication:function(t){i["a"].$cookies.get("jwt")?t.logged_in=!0:t.logged_in=!1},update_categories:function(t){Ce.a.post("https://cms.maximemoreillon.com/get_navigation_items").then((function(e){t.navigation_items.splice(0,t.navigation_items.length),e.data.forEach((function(e){var n=e._fields[e._fieldLookup["tag"]];t.navigation_items.push(n)}))})).catch((function(t){return console.log(t)}))}},actions:{},modules:{}}),je=n("a7fe"),Te=n.n(je),Ee=n("2b27"),Le=n.n(Ee);i["a"].use(Te.a,Ce.a),i["a"].use(Le.a),i["a"].config.productionTip=!1,Ie.beforeEach((function(t,e,n){Be.commit("check_authentication"),i["a"].$cookies.get("jwt")?Ce.a.defaults.headers.common["Authorization"]="Bearer ".concat(i["a"].$cookies.get("jwt")):delete Ce.a.defaults.headers.common["Authorization"],Be.commit("update_categories"),n()})),new i["a"]({router:Ie,store:Be,render:function(t){return t(m)}}).$mount("#app")},"6f16":function(t,e,n){"use strict";var i=n("824c"),a=n.n(i);a.a},"74e6":function(t,e,n){},"824c":function(t,e,n){},"93a1":function(t,e,n){},a851:function(t,e,n){"use strict";var i=n("5567"),a=n.n(i);a.a},aafc:function(t,e,n){},b545:function(t,e,n){"use strict";var i=n("32ff"),a=n.n(i);a.a},bf8a:function(t,e,n){"use strict";var i=n("93a1"),a=n.n(i);a.a},dd92:function(t,e,n){"use strict";var i=n("08cf"),a=n.n(i);a.a},f00f:function(t,e,n){"use strict";var i=n("aafc"),a=n.n(i);a.a},f869:function(t,e,n){"use strict";var i=n("099d"),a=n.n(i);a.a}});
//# sourceMappingURL=app.d287079f.js.map