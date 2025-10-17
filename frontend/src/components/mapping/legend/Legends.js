
import AccordionRoot from "../../ui/accordion/AccordionRoot";
import AccordionItem from "../../ui/accordion/AccordionItem";
import AccordionTrigger from "../../ui/accordion/AccordionTrigger";
import AccordionContent from "../../ui/accordion/AccordionContent";

function Legends({children}) {
  return (
    <div className="absolute bottom-20 right-4">
    
    <AccordionRoot
      className="w-[200px] rounded-md shadow-[0_2px_10px] shadow-black/5"
      type="single"
      defaultValue="item-1"
      collapsible
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="!bg-primary3 text-white">Legend</AccordionTrigger>
        <AccordionContent className="relative bg-white">
          {children}
        </AccordionContent>
      </AccordionItem>
    </AccordionRoot>
    </div>
  );
}

export default Legends;
