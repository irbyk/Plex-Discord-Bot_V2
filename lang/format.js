//https://stackoverflow.com/a/44932269
String.prototype.format = function(o) {
  var regexp = /{([^{]+)}/g;
  return this.replace(regexp,
                      function(ignore, key){
                        return (key = o[key]) == null ? '' : key;
                      });
}