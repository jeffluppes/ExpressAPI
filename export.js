use planes;
c = db.system.profile.find();
while(c.hasNext()) {
  printjson(c.next());
}
