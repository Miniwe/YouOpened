(function (Modernizr) {
    Modernizr.load([
        {
            load: [
                '//ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js'
            ],
            complete: function () {
                if ( !window.jQuery ) {
                    Modernizr.load('js/libs/jquery-1.7.1.js');
                }
            }
        },
        {
            load: [
                'js/plugins.js',
                'js/libs/underscore.js',
                'js/libs/backbone-min.js'
            ],
            complete: function () {
//                log('plugins+backbone loaded');
            }
        },
        {
            load: [
                'js/libs/jquery.tinysort.min.js',
                'js/libs/jquery.dateFormat-1.0.js',
                'js/libs/jquery.form.js',
                'js/libs/autoresize.jquery.min.js'
            ],
            complete: function () {
//                log('jquery libraries');
            }
        },
        {
            load: [
                'js/app/config.js',
                'js/app/router.js',
				
                'js/app/collection-extend.js',

                'js/app/models/tag.js',
                'js/app/collections/tags.js',
                
				'js/app/models/user.js',
                'js/app/collections/users.js',
				
				'js/app/models/fragment.js',
                'js/app/collections/fragments.js',
				
                'js/app/models/post.js',
                'js/app/collections/posts.js',
				
				'js/app/models/frame.js',
                'js/app/collections/frames.js',
				
				'js/app/models/tab.js',
                'js/app/collections/tabs.js',
                
				'js/app/models/template.js',
                'js/app/collections/templates.js',
				
                'js/app/models/siteuser.js',
                'js/app/views/siteuser.js',
				
                'js/app/views/sidebar.js',
                'js/app/views/searchview.js',
				
                'js/app/views/post.js',
				
                'js/app/views/frame.js',
				
                'js/app/views/tabheader.js',
                'js/app/views/tab.js',

                'js/app/models/t-request.js',
				
                'js/app/views/application.js'
            ],
            complete: function () {
//                log('application loaded');
            }
        },
        {
            load: [
                'js/app/models/application.js',
                'js/app/proto.js'
            ],
            complete: function () {
                var app = new Application(AppConfig);
//                log('scripts loaded and application started', Backbone);
            }
        }
    ])
}) (Modernizr);