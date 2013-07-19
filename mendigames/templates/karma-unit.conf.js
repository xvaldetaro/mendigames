basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  '{{ djangular_root }}/static/lib/angular/angular.js',
  '{{ djangular_root }}/static/lib/angular/angular-*.js',
  '{{ djangular_root }}/tests/lib/angular/angular-mocks.js',
  '{{ djangular_root }}/templates/app.js',
// NOTE: Place other Javascript dependencies here.
  '{{ djangular_root }}/static/lib/angular/underscore.js',
  '{{ djangular_root }}/static/lib/angular/ui-bootstrap-tpls-0.4.0.min.js',
  '{{ djangular_root }}/static/lib/angular/jquery-1.9.1.min.js',
  '{{ djangular_root }}/static/lib/angular/angular-dragdrop.min.js',
  '{{ djangular_root }}/static/lib/angular/restangular.js',
// JS Files to be tested: {% for app_path in app_paths %}
  '{{ app_path }}/app/js/**/*.js', // {% endfor %}
// JS Tests: {% for app_path in app_paths %}
  '{{ app_path }}/tests/unit/**/*.js' // {% endfor %}
];

autoWatch = true;

browsers = ['Chrome'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
