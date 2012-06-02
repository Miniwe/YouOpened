/* 
 * @fileOverview Стартовые значения конфигурации
 */

var AppConfig = {
    NAME : 'YouOpened',
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
	COMMENTS:	'massive',
	RELEVANCE: 'relevance'
};

var RenderMode = {
	NEW:	'new',
	UPDATE: 'update',
	CLEAR: 	'clear'
};

var AddMode = {
	REPLACE: 'replace',
	UPDATE: 'update'
};
