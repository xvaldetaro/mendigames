basePath = '../';

files = [
  ANGULAR_SCENARIO,
  ANGULAR_SCENARIO_ADAPTER,
  '{{ djangular_root }}/static/lib/angular/angular.js',
  '{{ djangular_root }}/static/lib/angular/angular-*.js',
  '{{ djangular_root }}/tests/lib/angular/angular-mocks.js',
  '{{ djangular_root }}/templates/app.js',
// NOTE: Place other Javascript dependencies here.
  '{{ djangular_root }}/static/lib/angular/underscore.js',
  '{{ djangular_root }}/static/lib/angular/restangular.js',
// JS Files to be tested: {% for app_path in app_paths %}
  '{{ app_path }}/tests/e2e/**/*.js' // {% endfor %}
];

autoWatch = false;

browsers = ['Chrome'];

singleRun = true;

logLevel = LOG_INFO;

urlRoot = '/e2e';
proxies = {
  '/': 'http://localhost:8000/'
};

junitReporter = {
  outputFile: 'test_out/e2e.xml',
  suite: 'e2e'
};
