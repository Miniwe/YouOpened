/* 
 * @fileOverview Стартовые значения конфигурации
 */

var AppConfig = {
    NAME : 'YouOpened',
//    serverUrl : 'http://50.30.33.122/framework/',
    SERVER : 'http://youopened.com/framework/',
    AUTH : 'http://youopened.com/authorization/',
    TEMPLATES : [
        'auth/user_on',
        'auth/user_off'
    ]
};

var TabState = {
	DEFAULT : false,
	ACTIVE : true
};

var FrameState = {
	COLLAPSED : false,
	EXPANDED : true
};

var SortType = {
	TIME:	'time',
	RELEVANCE: 'relevance'
};

var RenderMode = {
	NEW:	'new',
	UPDATE: 'update'
};

var AddMode = {
	REPLACE: 'replace',
	UPDATE: 'update'
};
