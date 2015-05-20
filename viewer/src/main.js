/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var StageView = require('views/StageView');
    var Director = require('tools/Director');
    var Utility = require('famous/utilities/Utility');
    var Modifier  = require('famous/core/Modifier');
    var Draggable = require('famous/modifiers/Draggable');
    var Scrollview = require("famous/views/Scrollview");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");

    // create the main context
    var mainContext = Engine.createContext();

    // your app here
    mainContext.setPerspective(1000);

    //var stageView = new StageView();
    var director = new Director();

    var actorExampleText = '<pre>\'Presenter Name\': { \n    type: \'html\', \n    content: \'BOB OWEN\', \n    properties: { \n        backfaceVisibility: \'visible\', \n        fontSize: \'6.5em\', \n        textAlign: \'center\' \n    }, \n    size: [700, 140], \n    position: [\'75%\', \'50%\'], \n    classes: [\'z2\'] \n}, \n</pre>';

    var actionExampleText = '<pre>{ \n    actor: \'Presenter Name\', \n    start: 7001, \n    stop: 8000, \n    type: \'rotateTo\', \n    properties: { \n        axis: \'x\', \n        angleInDegrees: 720, \n    } \n}, \n</pre>';

    var nodeDescriptions = {
        'Scrollster': {
            "nodes" : [
                {
                    "nodes" : [
                        {
                            "nodes" : [
                                {
                                    name:'Scrollster SSS1 Node 1',
                                    type: 'html',
                                    content: 'Scrollster SSS1 Node 1',
                                    properties: {
                                        backfaceVisibility: 'visible',
                                        fontSize: '100%',
                                        textAlign: 'center',
                                        backgroundColor: 'red',
                                        borderStyle: 'solid',
                                        borderColor: 'black',
                                        borderSize: '1'
                                    },
                                    size: [320, 80],
                                    position: ['60', '80'],
                                    classes: ['z2'],
                                    zPosition: 0,
                                    opacity: 0
                                },
                                {
                                    name:'Scrollster SSS2 Node 1',
                                    type: 'html',
                                    content: 'Scrollster SSS2 Node 1',
                                    properties: {
                                        backfaceVisibility: 'visible',
                                        fontSize: '100%',
                                        textAlign: 'center',
                                        backgroundColor: 'red',
                                        borderStyle: 'solid',
                                        borderColor: 'black',
                                        borderSize: '1'
                                    },
                                    size: [320, 80],
                                    position: ['60', '60'],
                                    classes: ['z2'],
                                    zPosition: 0,
                                    opacity: 0
                                },

                            ],
                            name:'Scrollster Sub 1 of Sub Node 1',
                            type: 'html',
                            content: 'Scrollster Sub 1 of Sub Node 1',
                            properties: {
                                backfaceVisibility: 'visible',
                                fontSize: '100%',
                                textAlign: 'center',
                                backgroundColor: 'red',
                                borderStyle: 'solid',
                                borderColor: 'black',
                                borderSize: '1'
                            },
                            size: [480, 160],
                            position: ['60', '60'],
                            classes: ['z2'],
                            zPosition: 0,
                            opacity: 0
                        },
                    ],
                    name:'Scrollster Sub Node 1',
                    type: 'html',
                    content: 'Scrollster Sub Node 1',
                    properties: {
                        backfaceVisibility: 'visible',
                        fontSize: '100%',
                        textAlign: 'center',
                        backgroundColor: 'yellow',
                        borderStyle: 'solid',
                        borderColor: 'black',
                        borderSize: '1'
                    },
                    size: [640, 320],
                    position: ['60', '60'],
                    classes: ['z2'],
                    zPosition: 0,
                    opacity: 0
                },
            ],
            type: 'html',
            //content: '<div class="vertCenter"><h1>MSHOWX</h1><p>METSHOW HTML5展示骨骼</div>',
            content: '<div class="vertCenter">rect1</div>',
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '200%',
                textAlign: 'center',
                backgroundColor: 'white',
                borderStyle: 'solid',
                borderColor: 'black',
                borderSize: '2'
            },
            size: [960, 640]/*['100%', '100%']*/,
            position: ['60', '120'],
            classes: ['z2'],
            zPosition: 1
        },
        'Instructions': {
            type: 'html',
            content: '<div>滚动或方向键</div>',
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '100%',
                textAlign: 'center',
                backgroundColor: 'white'
            },
            size: [640, 20],
            position: ['50%', '90%'],
            classes: ['z2'],
            zPosition: 1
        },
        'Action Labs Logo': {
            "nodes" : [
                {
                    name:'Action Labs Logo Sub Node 1',
                    type: 'html',
                    content: 'Action Labs Logo Sub Node 1',
                    properties: {
                        backfaceVisibility: 'visible',
                        fontSize: '100%',
                        textAlign: 'center',
                        backgroundColor: 'red',
                        borderStyle: 'solid',
                        borderColor: 'black',
                        borderSize: '2'
                    },
                    size: [160, 40],
                    position: ['50%', '0%'],
                    classes: ['z2'],
                    zPosition: 0,
                    opacity: 0
                },
                {
                    name:'Action Labs Logo Sub Node 2',
                    type: 'html',
                    content: 'Action Labs Logo Sub Node 2',
                    properties: {
                        backfaceVisibility: 'visible',
                        fontSize: '100%',
                        textAlign: 'center',
                        backgroundColor: 'green',
                        borderStyle: 'solid',
                        borderColor: 'black',
                        borderSize: '2'
                    },
                    size: [160, 40],
                    position: ['50%', '20%'],
                    classes: ['z2'],
                    zPosition: 0,
                    opacity: 0
                }
            ],

            type: 'image',
            content: 'content/images/mci-logo.jpg',
            properties: {
                backfaceVisibility: 'visible'
            },
            size: [320, 160],
            position: ['10%', '10%'],
            classes: ['z2'],
            zPosition: 0,
            opacity: 0
        },
        'Why Famous': {
            type: 'html',
            content: '<div class="vertCenter"><h1>幻灯片效果</h1></div>',
            zPosition: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '200%',
                textAlign: 'center'
            },
            size: ['100%', '30%'],
            position: ['0', '10%'],
            classes: ['z2']
        },
        'Speed': {
            type: 'html',
            content: '<div class="vertCenter">效率</div>',
            zPosition: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '300%',
                textAlign: 'center',
                backgroundColor: 'rgb(240,240,240)'
            },
            size: ['100%', 75],
            position: ['-150%', '30%'],
            classes: ['z2']
        },
        'Easing': {
            type: 'html',
            content: '<div class="vertCenter">Easing / Physics</div>',
            zPosition: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '300%',
                textAlign: 'center',
                backgroundColor: 'rgb(240,240,240)'
            },
            size: ['100%', 75],
            position: ['-150%', '50%'],
            classes: ['z2']
        },
        '3D': {
            type: 'html',
            content: '<div class="vertCenter">3D Transformations</div>',
            zPosition: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '300%',
                textAlign: 'center',
                backgroundColor: 'rgb(240,240,240)'
            },
            size: ['100%', 75],
            position: ['-150%', '70%'],
            classes: ['z2']
        },
        'How It Works': {
            type: 'html',
            content: '<div class="vertCenter"><h1>Layer附带Action</h1><p>关联 Layer and Actions</p></div>',
            zPosition: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '200%',
                textAlign: 'center'
            },
            size: ['100%', '30%'],
            position: ['50%', '7%'],
            classes: ['z2'],
            opacity: 0
        },
        'Action': {
            type: 'html',
            content: '<div class="vertCenter">Action</div>',
            zPosition: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '300%',
                textAlign: 'center',
                backgroundColor: 'rgb(83,83,83)',
                color: 'rgb(240,240,240)'
            },
            size: ['25%', '35%'],
            position: ['70%', '50%'],
            classes: ['z2'],
            opacity: 0
        },
        'Actor': {
            type: 'html',
            content: '<div class="vertCenter">Layer</div>',
            zPosition: 0,
            size: ['25%', '35%'],
            position: ['30%', '50%'],
            classes: ['z2'],
            opacity: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '300%',
                textAlign: 'center',
                backgroundColor: 'rgb(240,240,240)'
            }
        },
        'Actor Example': {
            type: 'html',
            content: '<div class="vertCenter code">' + actorExampleText + '<div>',
            zPosition: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '150%',
                backgroundColor: 'black',
                color: 'white',
                fontFamily: '"Lucida Console", Monaco, monospace'
            },
            size: ['40%', '50%'],
            position: ['70%', '50%'],
            classes: ['z2'],
            opacity: 0
        },
        'Action Example': {
            type: 'html',
            content: '<div class="vertCenter code">' + actionExampleText + '</div>',
            zPosition: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '150%',
                backgroundColor: 'white',
                color: 'black',
                fontFamily: '"Lucida Console", Monaco, monospace'
            },
            size: ['40%', '50%'],
            position: ['150%', '50%'],
            classes: ['z2'],
            opacity: 1
        },
        'Position': {
            type: 'html',
            content: '<div class="vertCenter box">Position</div>',
            zPosition: 0,
            size: [200, 200],
            position: ['50%', '50%'],
            classes: ['z2'],
            opacity: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '300%',
                textAlign: 'center',
                backgroundColor: 'rgb(240,240,240)'
            }
        },
        'Move To': {
            type: 'html',
            content: '<div class="vertCenter box">Move To</div>',
            zPosition: 0,
            size: [200, 200],
            position: ['50%', '50%'],
            classes: ['z2'],
            opacity: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '300%',
                textAlign: 'center',
                backgroundColor: 'rgb(240,240,240)'
            }
        },
        'Rotate To': {
            type: 'html',
            content: '<div class="vertCenter box">Rotate To</div>',
            zPosition: 0,
            size: [200, 200],
            position: ['50%', '50%'],
            classes: ['z2'],
            opacity: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '300%',
                textAlign: 'center',
                backgroundColor: 'rgb(240,240,240)'
            }
        },
        'Scale': {
            type: 'html',
            content: '<div class="vertCenter box">Scale</div>',
            zPosition: 0,
            size: [200, 200],
            position: ['50%', '50%'],
            classes: ['z2'],
            opacity: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '300%',
                textAlign: 'center',
                backgroundColor: 'rgb(240,240,240)'
            }
        },
        'Skew': {
            type: 'html',
            content: '<div class="vertCenter box">Skew</div>',
            zPosition: 0,
            size: [200, 200],
            position: ['50%', '50%'],
            classes: ['z2'],
            opacity: 0,
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '300%',
                textAlign: 'center',
                backgroundColor: 'rgb(240,240,240)'
            }
        },
        'Scrollster Final': {
            "nodes" : [
                {
                    name:'Scrollster Final Sub Node 1',
                    type: 'html',
                    content: 'Scrollster Final Sub Node 1',
                    properties: {
                        backfaceVisibility: 'visible',
                        fontSize: '100%',
                        textAlign: 'center',
                        backgroundColor: 'red',
                        borderStyle: 'solid',
                        borderColor: 'black',
                        borderSize: '1'
                    },
                    size: [320, 80],
                    position: ['50', '40'],
                    classes: ['z2'],
                    zPosition: 1,
                    opacity: 0
                },
                {
                    name:'Scrollster Final Sub Node 2',
                    type: 'html',
                    content: 'Scrollster Final Sub Node 2',
                    properties: {
                        backfaceVisibility: 'visible',
                        fontSize: '100%',
                        textAlign: 'center',
                        backgroundColor: 'red',
                        borderStyle: 'solid',
                        borderColor: 'black',
                        borderSize: '1'
                    },
                    size: [320, 80],
                    position: ['50', '50'],
                    classes: ['z2'],
                    zPosition: 1,
                    opacity: 0
                },

            ],
            type: 'html',
            content: '<div class="vertCenter"><h1>TODO:</h1><p>贝塞尔曲线动画,mobile based,iOS video,auto-layout,文本格式,效率考虑,and so on...</a></div>',
            properties: {
                backfaceVisibility: 'visible',
                fontSize: '200%',
                textAlign: 'center',
                backgroundColor: 'white'
            },
            size: ['100%', '100%'],
            position: ['50%', '50%'],
            classes: ['z2'],
            zPosition: 0,
            opacity: 0
        }
    };

    var actionDescriptions = [
        {
            actor: 'Scrollster',
            start: 0,
            stop: 1000,
            type: 'moveTo',
            properties: {
                location: ['150%', '50%']
            }
        },
        {
            actor: 'Instructions',
            start: 0,
            stop: 1000,
            type: 'opacity',
            properties: {
                finalOpacity: 0
            }
        },
        {
            actor: 'Action Labs Logo',
            start: 500,
            stop: 1000,
            setBreak: true,
            type: 'opacity',
            properties: {}
        },
        {
            actor: 'Action Labs Logo',
            start: 1001,
            stop: 2000,
            type: 'position',
            properties: {
                scaleX: 0,
                scaleY: 2.5
            }
        },
        {
            actor: 'Why Famous',
            start: 1001,
            stop: 1500,
            type: 'moveTo',
            properties: {
                location: ['50%', '10%'],
                curve: 'easeIn'
            }
        },
        {
            actor: 'Why Famous',
            start: 1501,
            stop: 2000,
            setBreak: true,
            type: 'moveTo',
            properties: {
                location: ['50%', '5%'],
                curve: 'easeIn'
            }
        },
        {
            actor: 'Speed',
            start: 2001,
            stop: 3000,
            type: 'moveTo',
            setBreak: true,
            properties: {
                location: ['50%', '30%'],
                curve: 'easeIn'
            }
        },
        {
            actor: 'Easing',
            start: 3001,
            stop: 4000,
            setBreak: true,
            type: 'moveTo',
            properties: {
                location: ['50%', '50%'],
                curve: 'spring'
            }
        },
        {
            actor: '3D',
            start: 4001,
            stop: 5000,
            type: 'moveTo',
            properties: {
                location: ['50%', '70%'],
                curve: 'linear'
            }
        },
        {
            actor: '3D',
            start: 4001,
            stop: 5000,
            setBreak: true,
            type: 'rotateTo',
            properties: {
                axis: 'x',
                angleInDegrees: 720,
                curve: 'linear'
            }
        },
        {
            actor: 'Why Famous',
            start: 5001,
            stop: 6000,
            type: 'moveTo',
            properties: {
                location: ['50%', '150%'],
                curve: 'linear'
            }
        },
        {
            actor: 'Speed',
            start: 5001,
            stop: 6000,
            type: 'moveTo',
            properties: {
                location: ['50%', '130%'],
                curve: 'easeIn'
            }
        },
        {
            actor: 'Easing',
            start: 5201,
            stop: 6000,
            type: 'moveTo',
            properties: {
                location: ['50%', '130%'],
                curve: 'easeIn'
            }
        },
        {
            actor: '3D',
            start: 5401,
            stop: 6000,
            type: 'moveTo',
            properties: {
                location: ['50%', '130%'],
                curve: 'easeIn'
            }
        },
        {
            actor: 'How It Works',
            start: 5800,
            stop: 7000,
            type: 'opacity',
            properties: {}
        },
        {
            actor: 'Actor',
            start: 6001,
            stop: 7000,
            setBreak: true,
            type: 'opacity',
            properties: {
                finalOpacity: 1
            }
        },
        {
            actor: 'Action',
            start: 7001,
            stop: 8000,
            setBreak: true,
            type: 'opacity',
            properties: {
                finalOpacity: 1
            }
        },
        {
            actor: 'Action',
            start: 8001,
            stop: 9000,
            type: 'moveTo',
            properties: {
                location: ['150%', '50%'],
                curve: 'linear'
            }
        },
        {
            actor: 'Actor Example',
            start: 8001,
            stop: 9000,
            type: 'opacity',
            setBreak: true,
            properties: {
                finalOpacity: 1
            }
        },
        {
            actor: 'Actor',
            start: 9001,
            stop: 10000,
            type: 'moveTo',
            properties: {
                location: ['150%', '50%'],
                curve: 'linear'
            }
        },
        {
            actor: 'Actor Example',
            start: 9001,
            stop: 10000,
            type: 'moveTo',
            properties: {
                location: ['150%', '50%'],
                curve: 'linear'
            }
        },
        {
            actor: 'Action',
            start: 10000,
            stop: 11000,
            type: 'moveTo',
            properties: {
                location: ['30%', '50%'],
                curve: 'easeOut'
            }
        },
        {
            actor: 'Action Example',
            start: 10000,
            stop: 11000,
            setBreak: true,
            type: 'moveTo',
            properties: {
                location: ['70%', '50%'],
                curve: 'easeOut'
            }
        },
        {
            actor: 'Action Example',
            start: 11000,
            stop: 11500,
            type: 'opacity',
            properties: {
                finalOpacity: 0
            }
        },
        {
            actor: 'Actor',
            start: 11000,
            stop: 11500,
            type: 'moveTo',
            setBreak: true,
            properties: {
                location: ['70%', '50%'],
                curve: 'linear'
            }
        },
        {
            actor: 'Action',
            start: 11500,
            stop: 13000,
            type: 'rotateTo',
            properties: {
                axis: 'z',
                angleInDegrees: '1080'
            }
        },
        {
            actor: 'Actor',
            start: 12000,
            stop: 12500,
            type: 'moveTo',
            properties: {
                location: ['50%', '50%'],
                curve: 'linear'
            }
        },
        {
            actor: 'Action',
            start: 12000,
            stop: 12500,
            type: 'moveTo',
            properties: {
                location: ['50%', '50%'],
                curve: 'linear'
            }
        },
        {
            actor: 'Actor',
            start: 12500,
            stop: 13000,
            type: 'rotateTo',
            properties: {
                axis: 'z',
                angleInDegrees: '360'
            }
        },
        {
            actor: 'Actor',
            start: 12500,
            stop: 13000,
            type: 'moveTo',
            properties: {
                location: ['50%', '150%'],
                curve: 'linear'
            }
        },
        {
            actor: 'Action',
            start: 12500,
            stop: 13000,
            setBreak: true,
            type: 'moveTo',
            properties: {
                location: ['50%', '150%'],
                curve: 'linear'
            }
        },
        {
            actor: 'Position',
            start: 13000,
            stop: 14000,
            setBreak: true,
            type: 'opacity',
            properties: {
                finalOpacity: 1
            }
        },
        {
            actor: 'Position',
            start: 14001,
            stop: 15000,
            setBreak: true,
            type: 'position',
            properties: {
                scaleX: 0.5,
                scaleY: 0
            }
        },
        {
            actor: 'Position',
            start: 15001,
            stop: 16000,
            type: 'position',
            properties: {
                scaleX: 0,
                scaleY: -3
            }
        },
        {
            actor: 'Move To',
            start: 15001,
            stop: 16000,
            setBreak: true,
            type: 'opacity',
            properties: {
                finalOpacity: 1
            }
        },
        {
            actor: 'Move To',
            start: 16001,
            stop: 17000,
            setBreak: true,
            type: 'moveTo',
            properties: {
                location: ['25%', '25%']
            }
        },
        {
            actor: 'Move To',
            start: 17001,
            stop: 18000,
            type: 'position',
            properties: {
                scaleX: 0,
                scaleY: -4
            }
        },
        {
            actor: 'Rotate To',
            start: 17001,
            stop: 18000,
            setBreak: true,
            type: 'opacity',
            properties: {
                finalOpacity: 1
            }
        },
        {
            actor: 'Rotate To',
            start: 18001,
            stop: 19000,
            setBreak: true,
            type: 'rotateTo',
            properties: {
                axis: 'y',
                angleInDegrees: 180
            }
        },
        {
            actor: 'Rotate To',
            start: 19001,
            stop: 20000,
            type: 'position',
            properties: {
                scaleX: 0,
                scaleY: -4
            }
        },
        {
            actor: 'Scale',
            start: 19001,
            stop: 20000,
            setBreak: true,
            type: 'opacity',
            properties: {
                finalOpacity: 1
            }
        },
        {
            actor: 'Scale',
            start: 20001,
            stop: 21000,
            setBreak: true,
            type: 'scale',
            properties: {
                changeRatioX: 3,
                changeRatioY: 3
            }
        },
        {
            actor: 'Scale',
            start: 21001,
            stop: 22000,
            type: 'position',
            properties: {
                scaleX: 0,
                scaleY: -5
            }
        },
        {
            actor: 'Skew',
            start: 21001,
            stop: 22000,
            setBreak: true,
            type: 'opacity',
            properties: {
                finalOpacity: 1
            }
        },
        {
            actor: 'Skew',
            start: 22001,
            stop: 23000,
            setBreak: true,
            type: 'skew',
            properties: {
                scaleZ: 0.75
            }
        },
        {
            actor: 'Skew',
            start: 23001,
            stop: 24000,
            type: 'position',
            properties: {
                scaleX: 0,
                scaleY: -5
            }
        },
        {
            actor: 'How It Works',
            start: 22001,
            stop: 23000,
            type: 'moveTo',
            properties: {
                location: ['50%', '-30%']
            }
        },
        {
            actor: 'Scrollster Final',
            start: 22000,
            stop: 24000,
            setBreak: true,
            type: 'rotateTo',
            properties: {
                axis: 'x',
                angleInDegrees: 360
            }
        },
        {
            actor: 'Scrollster Final',
            start: 23500,
            stop: 23600,
            type: 'opacity',
            properties: {
                finalOpacity: 1
            }
        }
    ];

    var dataContent = "dummy";
    Utility.loadURL("dataValue.json", function(data) {
        // Check response
        if (!data) {
            return;
        }

        // Consume response
        var content =  JSON.parse(data);



        var page;
        if(content.class === "MetProjectPage") {
            page = content;
        } else {
            var dataContent = content.pagesData;
            page = dataContent[0];
        }
        console.log("dataContent:" +  dataContent);

        var max_page_width = page.width;

        var max_page_height = page.height;

        var subpage_counts = 3;//page.pageIDs.length;

        var pageView = new StageView({
            pageId:  page.id_,
            size: [page.width, page.height],
            pageDesc: page
        });

        var originModifier = new Modifier({
            size:[max_page_width, max_page_height],
            origin: [0.5, 0],
            align: [0.5, 0]
        });

        director.populateStage(pageView, page.nodes);

        //mainContext.add(originModifier).add(pageView);




        //var draggable = new Draggable();
        //draggable.subscribe(pageView.scrollRecieverSurface);
        //mainContext.add(originModifier).add(draggable).add(pageView);

        var pageViews = [];

        pageViews.push(pageView)

        for(var subpageIdx = 0 ; subpageIdx < subpage_counts; subpageIdx ++ ) {
            var subpage = page;
            var subpageView = new StageView({
                pageId:  page.id_,
                size: [page.width, page.height],
                pageDesc: subpage
            });

            director.populateStage(subpageView, subpage.nodes);
            pageViews.push(subpageView);

            max_page_height +=  subpage.height;
        }

        var scrollview = new Scrollview();
        scrollview.sequenceFrom(pageViews);

        var contextSize = mainContext.getSize();
        var draggable = new Draggable({
                xRange: [0, 0],
                yRange: [- (max_page_height - contextSize[1]), 0]
            }
        );

        for(var pageView in pageViews) {
            draggable.subscribe(pageViews[pageView].scrollRecieverSurface);
        }

        var originScrollviewModifier = new Modifier({
            size:[max_page_width, max_page_height],
            origin: [0.5, 0],
            align: [0.5, 0]
        });

        mainContext.add(originScrollviewModifier).add(draggable).add(scrollview);

    }.bind(this));


    //director.populateStageNew(stageView, nodeDescriptions, actionDescriptions);
    //
    //mainContext.add(stageView);
});
