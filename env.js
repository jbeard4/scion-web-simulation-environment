/*
     Copyright 2012-2013 Jacob Beard

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

             http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
*/

$(document).ready(function(){
    var scion = require('scion');

    var scxmlContent = $('#scxmlContent'),
        initScxmlButton = $('#initScxmlButton'),
        scxmlTrace = $('#scxmlTrace'),
        scxmlSimulationControls = $('#scxmlSimulationControls'),
        eventNameField = $('#eventNameField'),
        linkButton = $("#linkButton"),
        vizButton = $("#vizButton");

    $(document.documentElement).keypress(function(e){
        if(e.charCode === 10 && e.ctrlKey){
            visualize();
        }
    });

    var codeMirror = CodeMirror.fromTextArea(scxmlContent[0], window.location.search.match(/keyMap=vim/) ? {keyMap:'vim'} : undefined);

    var scxmlInstance, svg;

    var listener = {
        onEntry : function(stateId){
            //console.log('onentry',stateId);
            d3.select(document.getElementById(stateId)).classed('highlighted',true);
        },
        onExit : function(stateId){
            //console.log('onexit',stateId);
            d3.select(document.getElementById(stateId)).classed('highlighted',false);
        }
    };

    if(window.location.hash){
        //assume it's url-encoded content, so parse and init it
        codeMirror.setValue(decodeURIComponent(window.location.hash.slice(1)));
        visualize();
        initInterpreter();
    }

    //add behaviour
    function visualize(e){
        try {
            var doc = (new DOMParser()).parseFromString(codeMirror.getValue(),"application/xml");
            scxmlTrace.empty();
            svg = ScxmlViz(scxmlTrace[0],doc,scxmlTrace.width(),scxmlTrace.height());
        }catch(err){
            console.error(err);
        }
    }

    function initInterpreter(){
        //read the content and load it up
        scion.documentStringToModel(codeMirror.getValue(),function(err,model){
            if(err){ 
                alert(err.message);
                throw err;
            }

            //clean up othe rinstance, if it exists
            if(scxmlInstance){
                scxmlInstance.unregisterListener(listener);
            } 

            scxmlInstance = new scion.SCXML(model);
            scxmlInstance.registerListener(listener); 

            var conf = scxmlInstance.start();
            
        });
    }

    vizButton.click(visualize);

    initScxmlButton.click(initInterpreter);

    linkButton.click(function(){
        window.location.hash = encodeURIComponent(codeMirror.getValue());
    });

    scxmlSimulationControls.submit(function(e){
        e.preventDefault();

        if(!scxmlInstance){
            var err = new Error('SCXML interpreter not loaded');
            alert(err.message);
            throw err;
        }

        var eventName = eventNameField.val(); 
        var conf = scxmlInstance.gen(eventName); 

        eventNameField.val(''); 
    }); 

    //try auto-visualizing every 1s

});
