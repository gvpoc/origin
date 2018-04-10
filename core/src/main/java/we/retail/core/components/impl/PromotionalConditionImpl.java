package we.retail.core.components.impl;

import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.Optional;
import org.apache.sling.models.annotations.Required;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.injectorspecific.ScriptVariable;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.factory.ModelFactory;
import we.retail.core.components.PromotionalCondition;

import javax.annotation.PostConstruct;
import java.util.Iterator;

/**
 * Created by j.peeters on 10/04/2018.
 */
@Model(
        adaptables = {SlingHttpServletRequest.class},
        adapters = {PromotionalCondition.class}, //
        resourceType = {PromotionalConditionImpl.RESOURCE_TYPE},
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class PromotionalConditionImpl implements PromotionalCondition {

    //points to the Card component
    protected static final String RESOURCE_TYPE = "weretail/components/content/promotionalCondition";

    @ValueMapValue
    private String title;

    @ValueMapValue
    private String description;

    @ChildResource
    @Optional
    public Resource promoproducts;

    @ScriptVariable
    @Required
    private PageManager pageManager;

    private Page currentPage;

    @Self
    @Required
    private SlingHttpServletRequest request;

    @OSGiService
    private ModelFactory modelFactory;

    @PostConstruct
    public void init() {
    }

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public String getDescription() {
        return description;
    }

    @Override
    public Resource getPromos() {
        return promoproducts;
    }

    @Override
    public String getTotalExlPromo() {
        double total = 0;
        Iterator<Resource> items = promoproducts.getChildren().iterator();
        while(items.hasNext()){
            Resource res = items.next();
            if(res.getValueMap().get("productoldprice") != null){
                try {
                    total += new Double((String) res.getValueMap().get("productoldprice"));
                }catch (Exception e){
                    System.out.print("error converting value to number");
                }
            }else if(res.getValueMap().get("productcurrentprice") != null){
                total += new Double((String) res.getValueMap().get("productcurrentprice"));
            }

        }

        return total > 0?""+total:"";
    }

    @Override
    public String getTotalPrice() {
        double total = 0;
        Iterator<Resource> items = promoproducts.getChildren().iterator();
        while(items.hasNext()){
            Resource res = items.next();
            if(res.getValueMap().get("productcurrentprice") != null){
                try {
                    total += new Double((String) res.getValueMap().get("productcurrentprice"));
                }catch (Exception e){
                    System.out.print("error converting value to number");
                }
            }

        }

        return total > 0?""+total:"";
    }

}
