({
	doInit : function(component, event, helper) {
		helper.query(component, helper.buildQuery(component));	
	},

	toggleOpen : function (component){
		//console.log("doing toggle");
		component.set("v.collapsed", !component.get("v.collapsed"));
	}
})