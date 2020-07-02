

class Component 
{
   constructor ()
   {
       this.isFirstRender = true;
   }
    //Override this to save component's data differently.
    async setData (...data)
    {
        this.data = data;
    }

    //Override this to get the markup to display the component.
    getMarkup ()
    {
        return ``;
    }

    createElement ()
    {
        const element = document.createElement ('div');
        element.innerHTML = this.getMarkup ();
        return element;
    }

    //Override this to change how the component gets rendered.
    renderElementAt (element, location)
    {
        this._location = location;
        this._element = element;
        location.insertAdjacentElement("beforeend", element);
        
        this.registerDOMListener ();
        this._elements = null;
        this.onRender ();
        this.isFirstRender = false;
    }

    async renderElement (location, ...data)
    {
        await this.setData (...data);
        this.renderElementAt (location, this.createElement());

        this._lastRender = {type:'element', data, location};
    }

    //Override this to change how the component gets rendered
    renderHTMLAt (markup, location, htmlLocation = 'beforeend')
    {
        this._location = location;

        const innerHTML = htmlLocation.toLowerCase () == 'innerhtml';

        if(innerHTML)
        {
            location.innerHTML = markup;
            this._element = location.firstElementChild;
        }
        else
        {
            location.insertAdjacentHTML (htmlLocation, markup);

        
        switch (htmlLocation)
        {
            case 'beforebegin':
                this._element = location.previousSibling;
            break;
            case "afterbegin":
                this._element = location.firstElementChild;
            break;
            case "beforeend":
                this._element = location.lastElementChild;
            break;
            case "afterend":
                this._element = location.nextSibling;
            break;
        }
    }
        this.registerDOMListener ();
        this._elements = null;
        this.onRender ();
        this.isFirstRender = false;
    }

    async renderHTML (location, htmlLocation = "beforeend", ...data)
    {
        await this.setData (...data);
        this.renderHTMLAt (this.getMarkup (), location, htmlLocation);
        this._lastRender = {type:'html', data, location, htmlLocation};
    }

  
    reRender = () =>
    {
        if (this._lastRender)
        {
            const {type, data, location, htmlLocation} = this._lastRender;

            if (type == 'html')
                this.renderHTML (this._location, htmlLocation, data);
                else 
                this.renderElement (location, data);
        }
    }

    registerDOMListener ()
    {
        addObserver (this);
    }


  
    onRender ()
    {

    }

    destroy ()
    {
        if (this._element)
        {
            this.removeAllChildren (this._element);
            if (this._element.parentNode)
                this._element.parentNode.removeChild (this._element);

            this._element = null;
            this.onDestroyed ();
        }
    }

    onDestroyed ()
    {

    }

    onRemoved ()
    {
    }

    removeAllChildren(element)
    {
        [...element.childNodes].forEach (child => 
            {
                element.removeChild (child);
                this.removeAllChildren (child);
            });
    }

    get elementIds ()
    {
        return {

        }
    }


    //use this only after component has been rendered :)
    get elements ()
    {
        if (this._elements)
        return this._elements;

        const result = {};
        Object.entries (this.elementIds).forEach (([id, elementId]) => {

            let element;
            if (this._element)
                element = this._element.querySelector (elementId) || this._element.parentNode.querySelector (elementId);
           else
                element = document.querySelector (elementId);

            result[id] = element;
        });
        this._elements = result;

        return result;
    }
}


export default Component;




const observers = new Map ([]);

function addObserver (element)
{
    const parent = element._element.parentNode;
    if (observers.has (parent))
    {
        const elements = observers.get (parent);
        if (elements.some (el => el == element))
        return;

        observers.set (parent, [...elements, element]);
        return;
    }

    let elements = [element];
    observers.set (parent, elements);

    let observer = new MutationObserver (function(mutations)
    {
        elements = observers.get (parent);
        const elementsRemoved = [];
        elements.forEach (el => 
            {
                if (!parent.contains (el._element))
                {
                    elementsRemoved.push (el);
                    el.onRemoved ();
                    el.destroy ();
                }
            });
            
        elements = elements.filter (el =>
            {
                return !elementsRemoved.some (el2 => el2 == el);
            });


        if (elements.length > 0)
            observers.set (parent, elements);
            else
            {
                observer.disconnect ();
                observer = null;
                observers.delete (parent);
            }
    });

    observer.observe (parent, {childList:true});


}
