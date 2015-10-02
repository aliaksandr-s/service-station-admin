var myApp = angular.module('myApp', ['ng-admin']);
myApp.config(['NgAdminConfigurationProvider', function(NgAdminConfigurationProvider) {
    var nga = NgAdminConfigurationProvider;
    // create an admin application
    var admin = nga.application('Service Station').baseApiUrl('http://localhost:3000/'); // main API endpoint
    // more configuation here later

    // set the fields of the user entity list view

    //Clients entity
    //list view
    var user = nga.entity('clients').label('Clients');
    user.listView().fields([
        nga.field('first name').isDetailLink(true),
        nga.field('last name'),
        nga.field('date Of Birth'),
        nga.field('address.city').label('City'),
        nga.field('phone'),
        nga.field('email'),
        nga.field('id', 'reference')
            .targetEntity(nga.entity('cars'))
            .targetField(nga.field('model'))
            .label('Car')
            .editable(false),
    ]).filters([
        nga.field('q', 'template')
                    .label('')
                    .pinned(true)
                    .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
    ]);

    //edition View
    user.editionView().fields([
        nga.field('first name'),
        nga.field('last name'),
        nga.field('date Of Birth'),
        nga.field('address.street').label('Street'),
        nga.field('address.city').label('City'),
        nga.field('address.zipcode').label('Zipcode'),
        nga.field('phone'),
        nga.field('email', 'email')
            .validation({ required: true }),
        nga.field('cars', 'referenced_list')
            .targetEntity(nga.entity('cars'))
            .targetReferenceField('carId')
            .targetFields([
                nga.field('make'),
                nga.field('model'),
                nga.field('year'),
                nga.field('vin'),
                nga.field('orders.date').label('Date'),
                nga.field('orders.orderAmount').label('Amount (US$)'),
                nga.field('orders.orderStatus').label('Order status'),
    ]),
        nga.field('id', 'reference')
            .targetEntity(nga.entity('cars'))
            .targetField(nga.field('make'))
            .label('Edit Car Info')
            .editable(false),
        nga.field('id', 'reference')
            .targetEntity(nga.entity('cars'))
            .targetField(nga.field('make'))
            .label('Add car')
            .editable(true)
            .permanentFilters({ 'orders.orderStatus': "" })
    ]);

    user.creationView().fields(user.editionView().fields());
    admin.addEntity(user);

    //Cars entity
    //cars list view
    var cars = nga.entity('cars');
    cars.listView().fields([
        nga.field('make').isDetailLink(true),
        nga.field('model'),
        nga.field('year'),
        nga.field('vin').label('VIN'),
        nga.field('orders.date').label('Date'),
        nga.field('orders.orderAmount', 'number').format('$0,0.00').label('Amount (US$)'),
        nga.field('orders.orderStatus').label('Order status'),
        nga.field('carId', 'reference')
            .targetEntity(user)
            .targetField(nga.field('first name'))
            .label('Customer')
            ]).filters([
                    nga.field('q', 'template')
                    .label('')
                    .pinned(true)
                    .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
            ]);
    //cars edition view
    cars.editionView().fields([
        nga.field('make'),
        nga.field('model'),
        nga.field('year'),
        nga.field('vin').label('VIN'),
        nga.field('orders.date').label('Date'),
        nga.field('orders.orderAmount').label('Amount (US$)'),
        // nga.field('orders.orderStatus').editable(false)
        //     .label('Order Status'),
        nga.field('orders.orderStatus', 'choice')
            .choices([
              { value: 'Completed', label: 'Completed' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Cancelled', label: 'Cancelled' },
          ])
            .label('Change Order Status'),
        nga.field('carId', 'reference')
            .targetEntity(user)
            .targetField(nga.field('first name'))
            .label('Customer')
            .editable(false)

    ]);

    cars.creationView().fields(cars.editionView().fields());
    admin.addEntity(cars);

    //menu edit
    admin.menu(nga.menu()
        .addChild(nga.menu(user).icon('<span class="glyphicon glyphicon-user"></span>'))
        .addChild(nga.menu(cars).icon('<span class="glyphicon glyphicon-wrench"></span>'))
    );
    // attach the admin application to the DOM and run it
    nga.configure(admin);
}]);

//URL Interceptor
myApp.config(['RestangularProvider', function(RestangularProvider) {
    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
        if (operation == "getList") {
            // custom pagination params
            if (params._page) {
                params._start = (params._page - 1) * params._perPage;
                params._end = params._page * params._perPage;
            }
            delete params._page;
            delete params._perPage;
            // custom sort params
            if (params._sortField) {
                params._sort = params._sortField;
                params._order = params._sortDir;
                delete params._sortField;
                delete params._sortDir;
            }
            // custom filters
            if (params._filters) {
                for (var filter in params._filters) {
                    params[filter] = params._filters[filter];
                }
                delete params._filters;
            }
        }
        return {
            params: params
        };
    });
}]);
