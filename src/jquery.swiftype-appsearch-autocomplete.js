(function ( $ ) {

    var defaultConfig = {
        searchKey: '',
        hostIdentifier: ''
    };

    var s_input;

    $.fn.swiftypeAppAutoComplete = function ( config ) {
        s_input = this;
        autoComplete.init(config);
    };
    
    var autoComplete = {

        settings : {},

        result_list : [],

        container : {},

        request_state: true,

        show_result: true,

        init : function (config) {
           this.settings = $.extend(defaultConfig, config);

           s_input.on('input', function () {
               if ($(this).val() == "") {
                   autoComplete.show_result = false;
                   autoComplete.reset();
               } else {
                   autoComplete.show_result = true;
                   autoComplete.result( $(this).val() );
               }
           });
        },

        result : function ( q ) {
            let request_data = this.requestData(q);
            if (request_data) {
                this.request_state = false;
                $.ajax({
                    method: "POST",
                    url: `https://${this.settings.hostIdentifier}.api.swiftype.com/api/as/v1/engines/${this.settings.engineIdentifier}/search`,
                    data: JSON.stringify(request_data),
                    dataType: "json",
                    beforeSend: function(request) {
                        request.setRequestHeader("Content-Type", 'application/json');
                        request.setRequestHeader("Authorization", `Bearer ${autoComplete.settings.searchKey}`);
                    }
                })
                    .done(function ( result ) {
                        autoComplete.request_state = true;
                        autoComplete.result_list = result.results;
                        if (autoComplete.show_result) {
                            autoComplete.initDropDown();
                        }
                    })
                    .fail(function ( error ) {
                        autoComplete.request_state = true;
                        console.error(error);
                    });
            }
        },

        requestData : function ( q ) {
            let request_data = {
                query: q
            };

            request_data['result_fields'] = {};
            request_data['result_fields'][this.settings.nameProperty] = { 'raw': {} };

            request_data['search_fields'] = {};
            request_data['search_fields'][this.settings.nameProperty] = {};

            if (this.settings.size) {
                if (!request_data.page) {
                    request_data.page = {};
                }

                request_data.page.size = this.settings.size;
            }

            return request_data;
        },

        initDropDown : function () {
            let result_ul;
            if (this.settings.container) {
                this.container = $(this.settings.container);
            }


            result_ul = (this.container.find('ul').attr('class')) ? this.container.find('ul') : this.container.append("<ul class='search_autocomplete_list'></ul>").find('ul');
            result_ul.html("");


            if (this.result_list.length > 0) {
                for(var index in this.result_list) {
                    let item_display = (this.settings.nameProperty) ? this.result_list[index][this.settings.nameProperty]['raw'] : this.result_list[index].id.raw;
                    result_ul.append(`<li class="search_autocomplete_item">${item_display}</li>`)
                }

                this.initItemOnClick();
            }
        },

        reset() {
            if (this.container) {
                if (this.container.find('ul').attr('class')) {
                    this.container.find('ul').html("");
                }
            }
        },

        initItemOnClick : function () {
            $(document).on('click', '.search_autocomplete_item', function () {
                s_input.val( $(this).html() );
                if (autoComplete.container.find('ul').attr('class')) {
                    autoComplete.container.find('ul').html("");
                }
            });
        }


    };



}(jQuery));