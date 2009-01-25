/*
 * abroad.ui.js - UI library for AB-ROAD Web Service
 * AUTHOR: Toshimasa Ishibashi iandeth [at] gmail.com
 * VERSION: 1.00
 */

// everything wrapped in jQuery -
// same effect as jQuery.noConflict() for use with prototype.js
(function($){

if( typeof( ABROAD ) != 'function' ) {
    ABROAD = function (){};
}
if( typeof( ABROAD.UI ) != 'function' ) {
    ABROAD.UI = function (){};
}

/*
 * ABROAD.UI.Dept.Pulldown - 出発地プルダウン
 * VERSION 1.00
 * CHANGES
 *   2007-08-21 v1.00 released
 */
if( typeof( ABROAD.UI.Dept ) != 'function' ) {
    ABROAD.UI.Dept = function (){};
}
/*
 * ABROAD.UI.Dept.Pulldown
 */
ABROAD.UI.Dept.Pulldown =
Class.create( Recruit.UI.Base.Pulldown, {
    _get_def_props: function (){
        return {
            id    : 'ab-dept-sel',
            name  : 'dept',
            label : '出発地'
        };
    },
    get_selections: function (){
        return {
            'TYO' : '東京',
            'NGO' : '名古屋',
            'OSA' : '大阪',
            'FUK' : '福岡',
            '999' : 'その他'
        };
    }
});

/*
 * ABROAD.UI.Order.Pulldown - 並び順プルダウン
 * VERSION 1.00
 * CHANGES
 *   2007-08-21 v1.00 released
 */
if( typeof( ABROAD.UI.Order ) != 'function' ) {
    ABROAD.UI.Order = function (){};
}
/*
 * ABROAD.UI.Order.Pulldown
 */
ABROAD.UI.Order.Pulldown =
Class.create( Recruit.UI.Base.Pulldown, {
    _get_def_props: function (){
        return {
            id             : 'ab-order-sel',
            name           : 'order',
            label          : '並び順',
            first_opt_text : '新着順'
        };
    },
    get_selections: function (){
        return {
            "1": "価格安い順",
            "2": "価格高い順",
            "3": "ツアー期間短い順",
            "4": "ツアー期間長い順"
        };
    }
});

/*
 * ABROAD.UI.Month.Pulldown - 出発月プルダウン
 * VERSION 1.00
 * CHANGES
 *   2007-12-21 v1.00 released
 */
if( typeof( ABROAD.UI.Month ) != 'function' ) {
    ABROAD.UI.Month = function (){};
}
/*
 * ABROAD.UI.Month.Pulldown
 */
ABROAD.UI.Month.Pulldown =
Class.create( Recruit.UI.Base.Pulldown, {
    _get_def_props: function (){
        return {
            id    : 'ab-month-sel',
            name  : 'ym',
            label : '出発月'
        };
    },
    get_selections: function ( y, m ){
        var dt = {};
        if( y && m ){
            // for unit testing
            dt = new Date( y, m-1 );
        }else{
            dt = new Date();
        }
        var m = dt.getMonth() + 1;
        var y = dt.getFullYear();
        var h = {};
        for ( var i=0; i<12; i++ ){
            if( m > 12 ){
                m = 1;
                y++;
            }
            m = m.toString();
            y = y.toString();
            if( m.length == 1 ){
                m = '0' + m;
            }
            h[ y + m ] = y + '年' + m + '月';
            m++;
        }
        return h;
    }
});

/*
 * ABROAD.UI.Price.Pulldown - 価格帯プルダウン
 * VERSION 1.00
 * CHANGES
 *   2007-12-21 v1.00 released
 */
if( typeof( ABROAD.UI.Price ) != 'function' ) {
    ABROAD.UI.Price = function (){};
}
/*
 * ABROAD.UI.Price.Pulldown
 *   - initialize both ABROAD.UI.Price.[Max|Min].Pulldown at once.
 */
ABROAD.UI.Price.Pulldown = Class.create({
    initialize: function ( arg ){
        arg = $.extend({
            'max' : undefined,
            'min' : undefined
        }, arg );
        var tgt = {
            'max' : ABROAD.UI.Price.Max.Pulldown,
            'min' : ABROAD.UI.Price.Min.Pulldown
        };
        this.instances = {};
        var _self = this;
        $.each( tgt, function (k,v){
            var d = v.prototype._get_def_props();
            d = $.extend( d, arg[ k ] );
            var elem_id = d.id;
            if( $( '#' + elem_id ).length > 0 ){
                _self.instances[ k ] = new v( arg[ k ] );
            }
        });
    }
});
/*
 * ABROAD.UI.Price.Max.Pulldown
 */
ABROAD.UI.Price.Max = function (){};
ABROAD.UI.Price.Max.Pulldown =
Class.create( Recruit.UI.Base.Pulldown, {
    prices: [
        3,4,5,6,7,8,9,10,15,20,25,30,35,40,45
    ],
    _get_def_props: function (){
        return {
            id             : 'ab-price-max-sel',
            name           : 'price_max',
            label          : '価格帯上限'
        };
    },
    get_selections: function (){
        var h = {};
        $.each( this.prices, function (i,v){
            var key = v * 10000;
            var val = v + '万円以内';
            h[ key ] = val;
        });
        return h;
    }
});

/*
 * ABROAD.UI.Price.Min.Pulldown
 */
ABROAD.UI.Price.Min = function (){};
ABROAD.UI.Price.Min.Pulldown =
Class.create( Recruit.UI.Base.Pulldown, {
    prices: [
        3,4,5,6,7,8,9,10,15,20,25,30,35,40,45
    ],
    _get_def_props: function (){
        return {
            id             : 'ab-price-min-sel',
            name           : 'price_min',
            label          : '価格帯下限'
        };
    },
    get_selections: function (){
        var h = {};
        $.each( this.prices, function (i,v){
            var key = v * 10000;
            var val = v + '万円以上';
            h[ key ] = val;
        });
        return h;
    }
});

/*
 * ABROAD.UI.Places.Pulldown - エリア選択 プルダウン
 * VERSION 1.01
 * CHANGES
 *   2008-03-26 v1.01 Recruit.UI.Base.Hierarchy 利用に変更
 *   2007-12-21 v1.00 released
 */
if( typeof( ABROAD.UI.Places ) != 'function' ) {
    ABROAD.UI.Places = function (){};
}
ABROAD.UI.Places.Pulldown =
Class.create( Recruit.UI.Base.Hierarchy, {
    _get_definition : function (){
        var ret = [
            { cls: ABROAD.UI.Places.Area.Pulldown    },
            { cls: ABROAD.UI.Places.Country.Pulldown },
            { cls: ABROAD.UI.Places.City.Pulldown    }
        ];
        return ret;
    }
});
/*
 * ABROAD.UI.Places.Area.Pulldown
 */
if( typeof( ABROAD.UI.Places.Area ) != 'function' ) {
    ABROAD.UI.Places.Area = function (){};
}
ABROAD.UI.Places.Area.Pulldown =
Class.create( Recruit.UI.Base.Pulldown.JSONP, {
    get_selections: function (){
        var ret = {};
        var _self = this;
        var arr = this._get_selections_material();
        $.each( arr, function (i,d){
            if( _self.with_tour_count ){
                ret[ d.code ] = d.name + '  (' + d.tour_count + ')';
            }else{
                ret[ d.code ] = d.name;
            }
        });
        return ret;
    },
    _get_def_props: function (){
        return {
            id    : 'ab-area-sel',
            name  : 'area',
            label : 'エリア'
        };
    },
    _get_driver: function (){
        return new Recruit.UI.Driver.JSONP({
            url : '/ab-road/area/v1/'
        });
    },
    _get_selections_material: function (){
        return this.driver.results.area;
    }
});
/*
 * ABROAD.UI.Places.Country.Pulldown
 */
if( typeof( ABROAD.UI.Places.Country ) != 'function' ) {
    ABROAD.UI.Places.Country = function (){};
}
ABROAD.UI.Places.Country.Pulldown =
Class.create( ABROAD.UI.Places.Area.Pulldown, {
    _get_def_props: function (){
        return {
            id         : 'ab-country-sel',
            name       : 'country',
            label      : '国',
            has_parent : true,
            parent     : 'area',
            area       : ''
        };
    },
    _get_driver: function (){
        return new Recruit.UI.Driver.JSONP({
            url : '/ab-road/country/v1/'
        });
    },
    _get_selections_material: function (){
        return this.driver.results.country;
    }
});
/*
 * ABROAD.UI.Places.City.Pulldown
 */
if( typeof( ABROAD.UI.Places.City ) != 'function' ) {
    ABROAD.UI.Places.City = function (){};
}
ABROAD.UI.Places.City.Pulldown =
Class.create( ABROAD.UI.Places.Area.Pulldown, {
    _get_def_props: function (){
        return {
            id         : 'ab-city-sel',
            name       : 'city',
            label      : '都市',
            has_parent : true,
            parent     : 'country',
            country    : ''
        };
    },
    _get_driver: function (){
        return new Recruit.UI.Driver.JSONP({
            url : '/ab-road/city/v1/'
        });
    },
    _get_selections_material: function (){
        return this.driver.results.city;
    }
});

/*
 * ABROAD.UI.Term.Pulldown - 期間プルダウン
 * VERSION 1.00
 * CHANGES
 *   2008-01-21 v1.00 released
 */
if( typeof( ABROAD.UI.Term ) != 'function' ) {
    ABROAD.UI.Term = function (){};
}
/*
 * ABROAD.UI.Term.Pulldown
 *   - initialize both ABROAD.UI.Term.[Max|Min].Pulldown at once.
 */
ABROAD.UI.Term.Pulldown = Class.create({
    initialize: function ( arg ){
        arg = $.extend({
            'max' : undefined,
            'min' : undefined
        }, arg );
        var tgt = {
            'max' : ABROAD.UI.Term.Max.Pulldown,
            'min' : ABROAD.UI.Term.Min.Pulldown
        };
        this.instances = {};
        var _self = this;
        $.each( tgt, function (k,v){
            var d = v.prototype._get_def_props();
            d = $.extend( d, arg[ k ] );
            var elem_id = d.id;
            if( $( '#' + elem_id ).length > 0 ){
                _self.instances[ k ] = new v( arg[ k ] );
            }
        });
    }
});
/*
 * ABROAD.UI.Term.Max.Pulldown
 */
ABROAD.UI.Term.Max = function (){};
ABROAD.UI.Term.Max.Pulldown =
Class.create( Recruit.UI.Base.Pulldown, {
    days: [
        2,3,4,5,6,7,8,9,10
    ],
    _get_def_props: function (){
        return {
            id             : 'ab-term-max-sel',
            name           : 'term_max',
            label          : '期間上限'
        };
    },
    get_selections: function (){
        var h = {};
        $.each( this.days, function (i,v){
            var key = v;
            var val = v + '日以内';
            h[ key ] = val;
        });
        return h;
    }
});

/*
 * ABROAD.UI.Term.Min.Pulldown
 */
ABROAD.UI.Term.Min = function (){};
ABROAD.UI.Term.Min.Pulldown =
Class.create( Recruit.UI.Base.Pulldown, {
    days: [
        2,3,4,5,6,7,8,9,10
    ],
    _get_def_props: function (){
        return {
            id             : 'ab-term-min-sel',
            name           : 'term_min',
            label          : '期間下限'
        };
    },
    get_selections: function (){
        var h = {};
        $.each( this.days, function (i,v){
            var key = v;
            var val = v + '日以上';
            h[ key ] = val;
        });
        return h;
    }
});

// end of jQuery no-conflict wrapper
})(jQuery);
