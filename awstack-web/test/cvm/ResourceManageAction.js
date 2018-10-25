function ResourceManageAction(){
    beforeEach(function() {
        browser.get('http://localhost:22555/#/view');
    });
    browser.sleep(3000)
    let resourceBtn = element(by.css('aside .icon-aw-storage1'))
    resourceBtn.click()
    let select_project=element.all(by.repeater('item in $data').row(0).column('item.name'));
    select_project.click(); 
}
module.exports = ResourceManageAction;