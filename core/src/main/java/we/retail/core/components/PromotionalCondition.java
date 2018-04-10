package we.retail.core.components;

import org.apache.sling.api.resource.Resource;

/**
 * Created by j.peeters on 10/04/2018.
 */
public interface PromotionalCondition {

	String getTitle();

	String getDescription();

	Resource getPromos();

	String getTotalExlPromo();

	String getTotalPrice();
}
