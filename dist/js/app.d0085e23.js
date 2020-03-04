(function(t){function e(e){for(var i,r,c=e[0],s=e[1],l=e[2],d=0,p=[];d<c.length;d++)r=c[d],Object.prototype.hasOwnProperty.call(a,r)&&a[r]&&p.push(a[r][0]),a[r]=0;for(i in s)Object.prototype.hasOwnProperty.call(s,i)&&(t[i]=s[i]);u&&u(e);while(p.length)p.shift()();return o.push.apply(o,l||[]),n()}function n(){for(var t,e=0;e<o.length;e++){for(var n=o[e],i=!0,c=1;c<n.length;c++){var s=n[c];0!==a[s]&&(i=!1)}i&&(o.splice(e--,1),t=r(r.s=n[0]))}return t}var i={},a={app:0},o=[];function r(e){if(i[e])return i[e].exports;var n=i[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=t,r.c=i,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/";var c=window["webpackJsonp"]=window["webpackJsonp"]||[],s=c.push.bind(c);c.push=e,c=c.slice();for(var l=0;l<c.length;l++)e(c[l]);var u=s;o.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"034f":function(t,e,n){"use strict";var i=n("85ec"),a=n.n(i);a.a},"04a9":function(t,e,n){},"08cf":function(t,e,n){},"099d":function(t,e,n){},"136c":function(t,e,n){t.exports=n.p+"img/logo.ae432409.svg"},"32ff":function(t,e,n){},"3eb0":function(t,e,n){},4935:function(t,e,n){"use strict";var i=n("04a9"),a=n.n(i);a.a},5567:function(t,e,n){},"56d7":function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var i=n("2b0e"),a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{attrs:{id:"app"}},[i("nav",[i("img",{staticClass:"logo",attrs:{src:n("136c"),alt:"logo"}}),i("router-link",{attrs:{to:"/"}},[t._v("All articles")]),t._l(t.$store.state.navigation_items,(function(e){return i("router-link",{key:e.identity.low,attrs:{to:{name:"tag",query:{id:e.identity.low}}}},[t._v(" "+t._s(e.properties.name)+" ")])}))],2),i("main",[i("router-view")],1)])},o=[],r=(n("28a9"),{name:"App",components:{},data:function(){return{categories:[],navigation:[{route:"/",icon:"",label:"All articles"}]}},mounted:function(){this.$store.commit("check_authentication"),this.$store.commit("update_categories")}}),c=r,s=(n("034f"),n("2877")),l=Object(s["a"])(c,a,o,!1,null,null,null),u=l.exports,d=n("8c4f"),p=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"container"},[t.article?n("Toolbar",[n("div",{staticClass:"dates_container"},[t.article.properties.creation_date?n("div",{},[t._v("Created: "+t._s(t.format_date(t.article.properties.creation_date)))]):t._e(),t.article.properties.edit_date?n("div",{},[t._v("Last edited: "+t._s(t.format_date(t.article.properties.edit_date)))]):t._e()]),t.article.properties.published&&t.$store.state.logged_in?n("div",{staticClass:"published_indicator"},[n("earth-icon",{staticClass:"publishing_status"}),n("span",[t._v("Published")])],1):t._e(),n("div",{staticClass:"tags_wrapper"},[n("span",[t._v("Tags: ")]),t._l(t.tags,(function(t){return n("Tag",{key:t.identity.low,attrs:{tag:t}})}))],2),n("div",{staticClass:"growing_spacer"}),n("IconButton",{on:{click:function(e){return t.$router.push({name:"article_list"})}}},[n("arrow-left-icon")],1),t.$store.state.logged_in?n("IconButton",{on:{click:function(e){return t.download_as_html_file()}}},[n("download-icon")],1):t._e(),t.$store.state.logged_in&&t.$route.query.id?n("IconButton",{on:{click:function(e){return t.$router.push({path:"article_editor",query:{id:t.article.identity.low}})}}},[n("pencil-icon")],1):t._e()],1):t._e(),t.article?n("article",{ref:"article_content",domProps:{innerHTML:t._s(t.article.properties.content)}}):t.loading?n("Loader"):n("div",[t._v("Article not found")]),n("Modal",{attrs:{open:t.modal.open},on:{close:function(e){t.modal.open=!1}}},[n("img",{staticClass:"modal_image",attrs:{src:t.modal.image_src,alt:""}})])],1)},f=[],_=(n("d3b7"),n("3ca3"),n("159b"),n("ddb0"),n("2b3d"),function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("button",{staticClass:"icon_button",class:{active:t.active},style:{fontSize:t.size},attrs:{type:"button"},on:{click:function(e){return t.button_clicked()}}},[t._t("default")],2)}),m=[],g={name:"IconButton",props:{size:{type:String,default:function(){return"100%"}},active:{type:Boolean,default:function(){return!1}}},methods:{button_clicked:function(){this.$emit("click"),this.$emit("buttonClicked")}}},h=g,v=(n("f869"),Object(s["a"])(h,_,m,!1,null,"644432b8",null)),b=v.exports,k=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"modal",class:{open:t.open},on:{click:function(e){return e.target!==e.currentTarget?null:t.$emit("close")}}},[n("div",{staticClass:"modal_window_outer"},[n("div",{staticClass:"modal_window_inner"},[t.close_button?n("span",{staticClass:"modal_close_button mdi mdi-close",on:{click:function(e){return e.target!==e.currentTarget?null:t.$emit("close")}}}):t._e(),t._t("default")],2)])])},y=[],w={name:"Modal",props:{open:Boolean,close_button:{type:Boolean,default:!0}}},x=w,I=(n("a851"),Object(s["a"])(x,k,y,!1,null,"0ba7d709",null)),$=I.exports,C=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"toolbar"},[t._t("default")],2)},L=[],B={name:"Toolbar"},j=B,E=(n("f00f"),Object(s["a"])(j,C,L,!1,null,"5892c8a7",null)),T=E.exports,O=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},A=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"loader"},[n("div",{staticClass:"spinner"})])}],M={name:"Loader"},q=M,P=(n("bf8a"),Object(s["a"])(q,O,A,!1,null,"7c3a0e35",null)),U=P.exports,D=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("span",{staticClass:"tag",on:{click:function(e){return e.stopPropagation(),t.tag_clicked()}}},[t.tag?n("span",[t._v(t._s(t.tag.properties.name))]):n("span",[t._v("Invalid tag")]),t.removable?n("span",{staticClass:"remove_button",on:{click:function(e){return e.stopPropagation(),t.$emit("remove")}}},[t._v("×")]):t._e()])},S=[],F=(n("b0c0"),{name:"Tag",props:{tag:{type:Object},removable:{type:Boolean,default:function(){return!1}},cickable:{type:Boolean,default:function(){return!1}}},methods:{tag_clicked:function(){"tag"===this.$route.name&&this.$route.query.id===this.tag.identity.low||this.$router.push({name:"tag",query:{id:this.tag.identity.low}})}}}),H=F,N=(n("dd92"),Object(s["a"])(H,D,S,!1,null,"ce8e08bc",null)),z=N.exports,R=(n("a15b"),{methods:{format_date:function(t){var e=new Date(t),n=e.getMonth()+1,i=e.getDate();return[e.getFullYear(),(n>9?"":"0")+n,(i>9?"":"0")+i].join("/")}}}),J=n("1487"),W=n.n(J),Q=n("57e5"),Y=n("17a2"),G=n("d902"),K=n("bb79"),V={components:{IconButton:b,Modal:$,Toolbar:T,Loader:U,Tag:z,EarthIcon:Y["a"],ArrowLeftIcon:Q["a"],PencilIcon:G["a"],DownloadIcon:K["a"]},mixins:[R],data:function(){return{article:null,tags:[],loading:!1,modal:{open:!1,image_src:""}}},mounted:function(){this.get_content()},methods:{get_content:function(){var t=this;"id"in this.$route.query&&(this.loading=!0,this.axios.post("https://cms.maximemoreillon.com/get_article_neo4j",{id:this.$route.query.id}).then((function(e){t.loading=!1,t.article=e.data[0]._fields[e.data[0]._fieldLookup["article"]],setTimeout(t.add_event_listeners_for_image_modals,100),setTimeout((function(){document.querySelectorAll("pre code").forEach((function(t){W.a.highlightBlock(t)}))}),10),e.data.forEach((function(e){var n=e._fields[e._fieldLookup["tag"]];n&&t.tags.push(n)}))})).catch((function(t){return alert(t)})))},add_event_listeners_for_image_modals:function(){var t=this;this.$refs.article_content.querySelectorAll("img").forEach((function(e){e.addEventListener("click",(function(e){t.modal.open=!0,t.modal.image_src=e.target.src}),!1)}))},download_as_html_file:function(){var t=window.document.createElement("a");t.href=window.URL.createObjectURL(new Blob([this.article.content],{type:"text/html"})),t.download="test.html",document.body.appendChild(t),t.click(),document.body.removeChild(t)}}},X=V,Z=(n("4935"),Object(s["a"])(X,p,f,!1,null,null,null)),tt=Z.exports,et=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"article_editor_view"},[t.$store.state.logged_in&&!t.article_loading?n("div",{staticClass:"authentication_wrapper"},[n("Toolbar",[n("div",{staticClass:"dates_container"},[t.article.properties.creation_date?n("div",{},[t._v("Created on "+t._s(t.format_date(t.article.properties.creation_date)))]):t._e(),t.article.properties.edit_date?n("div",{},[t._v("Last edited on "+t._s(t.format_date(t.article.properties.edit_date)))]):t._e()]),t._e(),n("div",{staticClass:"growing_spacer"}),t.$route.query.id?n("IconButton",{on:{click:function(e){return t.$router.push({name:"article",query:{id:t.$route.query.id}})}}},[n("arrow-left-icon")],1):n("IconButton",{on:{click:function(e){return t.$router.push({name:"article_list"})}}},[n("arrow-left-icon")],1),n("IconButton",{attrs:{active:t.editable},on:{click:function(e){t.editable=!t.editable}}},[n("pencil-icon")],1),n("IconButton",{on:{click:function(e){return t.submit_article()}}},[n("content-save-icon")],1),n("IconButton",{on:{click:function(e){return t.delete_article()}}},[n("delete-icon")],1),n("IconButton",{attrs:{active:t.article.properties.published},on:{click:function(e){return t.toggle_published()}}},[n("earth-icon")],1)],1),n("div",{staticClass:"tags_wrapper"},[n("label",{attrs:{for:"tag_search"}},[t._v("Tags: ")]),t._l(t.tags,(function(e,i){return n("Tag",{key:e.identity.low,attrs:{tag:e,removable:""},on:{remove:function(e){return t.delete_tag(i)}}})})),n("input",{ref:"tag_input",attrs:{id:"tag_search",type:"search",list:"existing_tag_list"},on:{keyup:[function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.add_tag()},function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"delete",[8,46],e.key,["Backspace","Delete","Del"])?null:t.delete_last_Tag()}]}}),n("datalist",{attrs:{id:"existing_tag_list"}},t._l(t.existing_tags,(function(t){return n("option",{key:t.identity.low,domProps:{value:t.properties.name}})})),0)],2),n("div",{staticClass:"editor_wrapper"},[n("editor-menu-bar",{attrs:{editor:t.editor},scopedSlots:t._u([{key:"default",fn:function(e){var i=e.commands,a=e.isActive,o=e.getMarkAttrs;return[n("div",{staticClass:"menubar"},[n("IconButton",{attrs:{active:a.bold()},on:{click:i.bold}},[n("format-bold-icon")],1),n("IconButton",{attrs:{active:a.italic()},on:{click:i.italic}},[n("format-italic-icon")],1),n("IconButton",{attrs:{active:a.strike()},on:{click:i.strike}},[n("format-strikethrough-icon")],1),n("IconButton",{attrs:{active:a.underline()},on:{click:i.underline}},[n("format-underline-icon")],1),n("IconButton",{attrs:{active:a.code()},on:{click:i.code}},[n("code-tags-icon")],1),n("IconButton",{attrs:{active:a.paragraph()},on:{click:i.paragraph}},[n("format-paragraph-icon")],1),n("IconButton",{attrs:{active:a.heading({level:1})},on:{click:function(t){return i.heading({level:1})}}},[n("format-header-1-icon")],1),n("IconButton",{attrs:{active:a.heading({level:2})},on:{click:function(t){return i.heading({level:2})}}},[n("format-header-2-icon")],1),n("IconButton",{attrs:{active:a.heading({level:3})},on:{click:function(t){return i.heading({level:3})}}},[n("format-header-3-icon")],1),n("IconButton",{attrs:{active:a.bullet_list()},on:{click:i.bullet_list}},[n("format-list-bulleted-icon")],1),n("IconButton",{attrs:{active:a.ordered_list()},on:{click:i.ordered_list}},[n("format-list-numbered-icon")],1),n("IconButton",{attrs:{active:a.blockquote()},on:{click:i.blockquote}},[n("format-quote-close-icon")],1),n("IconButton",{attrs:{active:a.code_block()},on:{click:i.code_block}},[n("code-tags-icon")],1),n("IconButton",{on:{click:i.undo}},[n("undo-icon")],1),n("IconButton",{on:{click:i.redo}},[n("redo-icon")],1),n("IconButton",{on:{click:function(e){return t.showImagePrompt(i.image)}}},[n("image-icon")],1),t.linkMenuIsActive?n("form",{on:{submit:function(e){return e.preventDefault(),t.setLinkUrl(i.link,t.linkUrl)}}},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.linkUrl,expression:"linkUrl"}],ref:"linkInput",attrs:{type:"text",placeholder:"https://"},domProps:{value:t.linkUrl},on:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"esc",27,e.key,["Esc","Escape"])?null:t.hideLinkMenu(e)},input:function(e){e.target.composing||(t.linkUrl=e.target.value)}}}),n("IconButton",{staticClass:"menubar_button",attrs:{type:"button"},on:{click:function(e){return t.setLinkUrl(i.link,null)}}},[n("delete-icon")],1)],1):n("IconButton",{staticClass:"menubar_button",class:{"is-active":a.link()},on:{click:function(e){t.showLinkMenu(o("link"))}}},[n("link-icon")],1)],1)]}}],null,!1,589649747)}),n("div",{staticClass:"editor"},[n("editor-content",{staticClass:"editor_content",attrs:{editor:t.editor}})],1)],1)],1):t._e(),t.$store.state.logged_in&&t.article_loading?n("Loader"):t._e(),t.$store.state.logged_in?t._e():n("div",{},[t._v(" Articles cannot be edited by unauthenticated user ")])],1)},nt=[],it=(n("a434"),n("cd42")),at=n("f23d"),ot=n("d4ec"),rt=n("bee2"),ct=n("99de"),st=n("7e84"),lt=n("262e"),ut=function(t){function e(){return Object(ot["a"])(this,e),Object(ct["a"])(this,Object(st["a"])(e).apply(this,arguments))}return Object(lt["a"])(e,t),Object(rt["a"])(e,[{key:"name",get:function(){return"iframe"}},{key:"schema",get:function(){return{attrs:{src:{default:null}},group:"block",selectable:!1,parseDOM:[{tag:"iframe",getAttrs:function(t){return{src:t.getAttribute("src")}}}],toDOM:function(t){return["iframe",{src:t.attrs.src,frameborder:0,allowfullscreen:"true"}]}}}},{key:"view",get:function(){return{props:["node","updateAttrs","view"],computed:{src:{get:function(){return this.node.attrs.src},set:function(t){this.updateAttrs({src:t})}}},template:'\n        <div class="iframe">\n          <iframe class="iframe__embed" :src="src"></iframe>\n          <input class="iframe__input" @paste.stop type="text" v-model="src" v-if="view.editable" />\n        </div>\n      '}}}]),e}(it["f"]),dt=n("4dd1"),pt=n.n(dt),ft=n("ee8c"),_t=n.n(ft),mt=n("f0f8"),gt=n.n(mt),ht=n("9510"),vt=n.n(ht),bt=n("b65b"),kt=n.n(bt),yt=n("44b5"),wt=n.n(yt),xt=n("0209"),It=n.n(xt),$t=n("8dcb"),Ct=n.n($t),Lt=n("0647"),Bt=n("0fc3"),jt=n("fa90"),Et=n("c55d"),Tt=n("2672"),Ot=n("b53f"),At=n("0119"),Mt=n("b00a"),qt=n("aca8"),Pt=n("c756"),Ut=n("3610"),Dt=n("0148"),St=n("ddd9"),Ft=n("3048"),Ht=n("1a4c"),Nt=n("16f7"),zt=n("7143"),Rt=n("ad93"),Jt={components:{Toolbar:T,Loader:U,Tag:z,IconButton:b,EditorContent:it["b"],EditorMenuBar:it["c"],ArrowLeftIcon:Q["a"],DeleteIcon:Lt["a"],ContentSaveIcon:Bt["a"],EarthIcon:Y["a"],CodeTagsIcon:jt["a"],FormatHeader1Icon:Et["a"],FormatHeader2Icon:Tt["a"],FormatHeader3Icon:Ot["a"],FormatBoldIcon:Mt["a"],FormatItalicIcon:qt["a"],FormatStrikethroughIcon:Pt["a"],FormatUnderlineIcon:Ut["a"],FormatParagraphIcon:At["a"],FormatListBulletedIcon:Dt["a"],FormatListNumberedIcon:St["a"],FormatQuoteCloseIcon:Ft["a"],UndoIcon:Ht["a"],RedoIcon:Nt["a"],LinkIcon:zt["a"],PencilIcon:G["a"],ImageIcon:Rt["a"]},mixins:[R],data:function(){var t=this;return{editor:new it["a"]({extensions:[new at["a"],new at["c"],new at["e"],new at["g"],new at["h"]({levels:[1,2,3]}),new at["j"],new at["n"],new at["o"],new at["r"],new at["s"],new at["m"],new at["b"],new at["d"],new at["l"],new at["q"],new at["t"],new at["i"],new at["k"],new at["p"]({emptyEditorClass:"is-editor-empty",emptyNodeClass:"is-empty",emptyNodeText:"Write something …",showOnlyWhenEditable:!0,showOnlyCurrent:!0}),new at["f"]({languages:{javascript:pt.a,css:_t.a,shell:kt.a,python:vt.a,bash:gt.a,dockerfile:wt.a,cpp:It.a,xml:Ct.a}}),new ut],editable:!0,content:"",onUpdate:function(e){var n=e.getHTML;t.article.properties.content=n(),t.set_article_title(),t.set_article_summary(),t.set_article_thumbnail_src()}}),article:{properties:{content:null,published:!1,title:"",summary:"",thumbnail_src:"",creation_date:new Date,edit_date:new Date}},tags:[],linkUrl:null,linkMenuIsActive:!1,editable:!0,article_loading:!0,existing_tags:[]}},watch:{editable:function(){this.editor.setOptions({editable:this.editable})}},mounted:function(){this.get_article_if_exists(),this.get_existing_tags()},beforeDestroy:function(){this.editor.destroy()},methods:{get_article_if_exists:function(){var t=this;"id"in this.$route.query?(this.article_loading=!0,this.axios.post("https://cms.maximemoreillon.com/get_article_neo4j",{id:this.$route.query.id}).then((function(e){t.article=e.data[0]._fields[e.data[0]._fieldLookup["article"]],t.editor.setContent(t.article.properties.content),e.data.forEach((function(e){var n=e._fields[e._fieldLookup["tag"]];n&&t.tags.push(n)})),t.article_loading=!1})).catch((function(t){return alert(t)}))):this.article_loading=!1},toggle_published:function(){this.article.properties.published=!this.article.properties.published},submit_article:function(){var t=this;this.article_loading=!0,this.article.properties.edit_date=new Date,this.$route.query.id?this.axios.post("https://cms.maximemoreillon.com/update_article_neo4j",{article:this.article,tags:this.tags}).then((function(e){t.article_loading=!1;var n=e.data[0]._fields[e.data[0]._fieldLookup["article"]].identity.low;t.$router.push({name:"article",query:{id:n}})})).catch((function(t){return console.log(t.response.data)})):this.axios.post("https://cms.maximemoreillon.com/create_article_neo4j",{article:this.article,tags:this.tags}).then((function(e){t.article_loading=!1;var n=e.data[0]._fields[e.data[0]._fieldLookup["article"]].identity.low;t.$router.push({name:"article",query:{id:n}})})).catch((function(t){return console.log(t.response.data)}))},delete_article:function(){var t=this;confirm("Delete article?")&&(this.article_loading=!0,this.axios.post("https://cms.maximemoreillon.com/delete_article_neo4j",{id:this.$route.query.id}).then((function(){t.article_loading=!1,t.$router.push({name:"article_list"})})).catch((function(t){return alert(t)})))},add_tag:function(){var t=this;this.axios.post("https://cms.maximemoreillon.com/create_tag_neo4j",{tag_name:this.$refs.tag_input.value}).then((function(e){var n=e.data[0]._fields[e.data[0]._fieldLookup["tag"]];t.tags.push(n)})).catch((function(t){return console.log(t.response.data)})),this.$refs.tag_input.value=""},delete_tag:function(t){this.tags.splice(t,1)},delete_last_Tag:function(){this.tags.pop()},get_existing_tags:function(){var t=this;this.axios.post("https://cms.maximemoreillon.com/get_tag_list_neo4j",{}).then((function(e){t.existing_tags.splice(0,t.existing_tags.length),e.data.forEach((function(e){var n=e._fields[e._fieldLookup["tag"]];t.existing_tags.push(n)}))})).catch((function(t){return alert(t)}))},set_article_title:function(){var t=document.createElement("div");t.innerHTML=this.article.properties.content;var e=t.getElementsByTagName("h1")[0];e&&(this.article.properties.title=e.innerHTML)},set_article_summary:function(){var t=document.createElement("div");t.innerHTML=this.article.properties.content;var e=t.getElementsByTagName("p")[0];e&&(this.article.properties.summary=e.innerHTML)},set_article_thumbnail_src:function(){var t=document.createElement("div");t.innerHTML=this.article.properties.content;var e=t.getElementsByTagName("img")[0];e&&(this.article.properties.thumbnail_src=e.src)},showLinkMenu:function(t){var e=this;this.linkUrl=t.href,this.linkMenuIsActive=!0,this.$nextTick((function(){e.$refs.linkInput.focus()}))},hideLinkMenu:function(){this.linkUrl=null,this.linkMenuIsActive=!1},setLinkUrl:function(t,e){t({href:e}),this.hideLinkMenu()},showImagePrompt:function(t){var e=prompt("Enter the url of your image here");null!==e&&t({src:e})},parse_file:function(t){var e=this,n=t.srcElement.files[0],i=new FileReader;i.onload=function(t){return e.article.content=t.target.result},i.onerror=function(t){return console.log(t)},i.readAsText(n)}}},Wt=Jt,Qt=(n("b545"),Object(s["a"])(Wt,et,nt,!1,null,null,null)),Yt=Qt.exports,Gt=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"article_list_view"},[n("Toolbar",[n("div",{staticClass:"growing_spacer"}),t.$store.state.logged_in?n("IconButton",{on:{buttonClicked:function(e){return t.new_article()}}},[n("plus-icon")],1):t._e()],1),t.articles_loading?n("Loader"):n("div",{staticClass:"articles_container"},t._l(t.articles,(function(t,e){return n("ArticlePreview",{key:e,attrs:{article:t}})})),1)],1)},Kt=[],Vt=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"article_preview",on:{click:function(e){return t.$router.push({path:"article",query:{id:t.article.identity.low}})}}},[t.article.properties.published&&t.$store.state.logged_in?n("earth-icon",{staticClass:"publishing_status"}):t._e(),n("div",{staticClass:"article_title"},[t._v(t._s(t.article.properties.title))]),t.article.properties.creation_date?n("div",{staticClass:"article_metadata"},[n("span",{staticClass:"article_date"},[t._v(t._s(t.format_date(t.article.properties.creation_date)))])]):t._e(),t.article.properties.thumbnail_src?n("img",{staticClass:"article_thumbnail",attrs:{src:t.article.properties.thumbnail_src,alt:""}}):t._e(),t.article.properties.summary?n("div",{staticClass:"article_summary",domProps:{innerHTML:t._s(t.article.properties.summary)}}):t._e(),t.tags?n("div",{staticClass:"tags_container"},t._l(t.tags,(function(t){return n("Tag",{key:t.identity.low,attrs:{tag:t}})})),1):t.tags_loading?n("div",{staticClass:"tags_container"},[t._v("Loading")]):t._e()],1)},Xt=[],Zt={name:"ArticlePreview",props:{article:Object},data:function(){return{tags:[],tags_loading:!1}},mixins:[R],components:{Tag:z,EarthIcon:Y["a"]},mounted:function(){this.get_tags()},methods:{get_tags:function(){var t=this;this.tags_loading=!0,this.axios.post("https://cms.maximemoreillon.com/get_tags_of_article",{id:this.article.identity.low}).then((function(e){t.tags.splice(0,t.tags.length),e.data.forEach((function(e){var n=e._fields[e._fieldLookup["tag"]];t.tags.push(n)})),t.tags_loading=!1})).catch((function(t){console.log(t.response.data)}))}}},te=Zt,ee=(n("9681"),Object(s["a"])(te,Vt,Xt,!1,null,"50e2ac7e",null)),ne=ee.exports,ie=n("758f"),ae={components:{IconButton:b,ArticlePreview:ne,Toolbar:T,Loader:U,PlusIcon:ie["a"]},data:function(){return{articles:[],articles_loading:!1}},methods:{new_article:function(){this.$router.push({path:"article_editor"})},get_articles:function(){var t=this;this.articles_loading=!0,this.articles.splice(0,this.articles.length),this.axios.post("https://cms.maximemoreillon.com/get_article_list_neo4j",{}).then((function(e){e.data.forEach((function(e){var n=e._fields[e._fieldLookup["article"]];t.articles.push(n)})),t.articles_loading=!1})).catch((function(t){console.log(t.response.data)}))}},mounted:function(){this.get_articles()}},oe=ae,re=(n("80df"),Object(s["a"])(oe,Gt,Kt,!1,null,"bc49af00",null)),ce=re.exports,se=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"tag_view"},[t.tag&&!t.loading?n("div",{staticClass:"wrapper"},[n("div",{staticClass:"tag_wrapper"},[n("Tag",{attrs:{tag:t.tag}}),n("div",{},[t._v(" Show on navigation: "),n("input",{directives:[{name:"model",rawName:"v-model",value:t.tag.properties.navigation_item,expression:"tag.properties.navigation_item"}],attrs:{type:"checkbox"},domProps:{checked:Array.isArray(t.tag.properties.navigation_item)?t._i(t.tag.properties.navigation_item,null)>-1:t.tag.properties.navigation_item},on:{change:[function(e){var n=t.tag.properties.navigation_item,i=e.target,a=!!i.checked;if(Array.isArray(n)){var o=null,r=t._i(n,o);i.checked?r<0&&t.$set(t.tag.properties,"navigation_item",n.concat([o])):r>-1&&t.$set(t.tag.properties,"navigation_item",n.slice(0,r).concat(n.slice(r+1)))}else t.$set(t.tag.properties,"navigation_item",a)},function(e){return t.update_tag()}]}})])],1),t.articles.length>0?n("div",{staticClass:"articles_container"},t._l(t.articles,(function(t){return n("ArticlePreview",{key:t.identity.low,attrs:{article:t}})})),1):t._e()]):t.loading?n("Loader"):t._e()],1)},le=[],ue={components:{Loader:U,Tag:z,ArticlePreview:ne},data:function(){return{loading:!1,tag:null,articles:[]}},mounted:function(){this.get_tag(this.$route.query.id)},beforeRouteUpdate:function(t,e,n){this.get_tag(t.query.id),n()},methods:{get_tag:function(t){var e=this;"id"in this.$route.query&&(this.loading=!0,this.axios.post("https://cms.maximemoreillon.com/get_tag_neo4j",{id:t}).then((function(t){var n=t.data[0];e.tag=n._fields[n._fieldLookup["tag"]],e.loading=!1,e.axios.post("https://cms.maximemoreillon.com/get_articles_of_tag",{id:e.tag.identity.low}).then((function(t){e.articles.splice(0,e.articles.length),t.data.forEach((function(t){var n=t._fields[t._fieldLookup["article"]];e.articles.push(n)}))})).catch((function(t){return console.log(t.response.data)}))})).catch((function(t){return console.log(t.response.data)})))},update_tag:function(){var t=this;"id"in this.$route.query&&(this.loading=!0,this.axios.post("https://cms.maximemoreillon.com/update_tag_neo4j",{tag:this.tag}).then((function(){t.get_tag(),t.$store.commit("update_categories")})).catch((function(t){return alert(t)})))}}},de=ue,pe=(n("6c0f"),Object(s["a"])(de,se,le,!1,null,"1e244174",null)),fe=pe.exports;i["a"].use(d["a"]);var _e=[{path:"/",name:"article_list",component:ce},{path:"/article",name:"article",component:tt,props:!0},{path:"/article_editor",name:"article_editor",component:Yt,props:!0},{path:"/tag",name:"tag",component:fe}],me=new d["a"]({mode:"history",base:"/",routes:_e}),ge=me,he=n("2f62"),ve=n("bc3a"),be=n.n(ve);i["a"].use(he["a"]);var ke=new he["a"].Store({state:{logged_in:!1,navigation_items:[]},mutations:{check_authentication:function(t){i["a"].$cookies.get("jwt")?t.logged_in=!0:t.logged_in=!1},update_categories:function(t){be.a.post("https://cms.maximemoreillon.com/get_navigation_items").then((function(e){t.navigation_items.splice(0,t.navigation_items.length),e.data.forEach((function(e){var n=e._fields[e._fieldLookup["tag"]];t.navigation_items.push(n)}))})).catch((function(t){return console.log(t)}))}},actions:{},modules:{}}),ye=n("a7fe"),we=n.n(ye),xe=n("2b27"),Ie=n.n(xe);i["a"].use(we.a,be.a),i["a"].use(Ie.a),i["a"].config.productionTip=!1,ge.beforeEach((function(t,e,n){ke.commit("check_authentication"),i["a"].$cookies.get("jwt")?be.a.defaults.headers.common["Authorization"]="Bearer ".concat(i["a"].$cookies.get("jwt")):delete be.a.defaults.headers.common["Authorization"],n()})),new i["a"]({router:ge,store:ke,render:function(t){return t(u)}}).$mount("#app")},"6c0f":function(t,e,n){"use strict";var i=n("3eb0"),a=n.n(i);a.a},"80df":function(t,e,n){"use strict";var i=n("f4e0"),a=n.n(i);a.a},"85ec":function(t,e,n){},"93a1":function(t,e,n){},9681:function(t,e,n){"use strict";var i=n("a96f"),a=n.n(i);a.a},a851:function(t,e,n){"use strict";var i=n("5567"),a=n.n(i);a.a},a96f:function(t,e,n){},aafc:function(t,e,n){},b545:function(t,e,n){"use strict";var i=n("32ff"),a=n.n(i);a.a},bf8a:function(t,e,n){"use strict";var i=n("93a1"),a=n.n(i);a.a},dd92:function(t,e,n){"use strict";var i=n("08cf"),a=n.n(i);a.a},f00f:function(t,e,n){"use strict";var i=n("aafc"),a=n.n(i);a.a},f4e0:function(t,e,n){},f869:function(t,e,n){"use strict";var i=n("099d"),a=n.n(i);a.a}});
//# sourceMappingURL=app.d0085e23.js.map