import AccordionRoot from "../../ui/accordion/AccordionRoot";
import AccordionItem from "../../ui/accordion/AccordionItem";
import AccordionTrigger from "../../ui/accordion/AccordionTrigger";
import AccordionContent from "../../ui/accordion/AccordionContent";

function SPEI_Legend({ ColorLegendsDataItem }) {
  const { Title, Unit, Colors, Value, Labels } = ColorLegendsDataItem;

  const reversedColors = [...Colors].reverse();
  const reversedLabels = [...Labels].reverse();
  const reversedValues = [...Value].reverse();
  return (
    <div className="absolute bottom-20 right-4">
      <AccordionRoot
        className="w-[200px] rounded-md shadow-[0_2px_10px] shadow-black/5"
        type="single"
        defaultValue="item-1"
        collapsible
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="!bg-primary3 text-white">
            Legend
          </AccordionTrigger>
          <AccordionContent className="relative bg-white">
            <div className="mb-2">
              <p>{Unit}</p>
            </div>
            {reversedColors.map((color, index) => (
              <div key={index} className="flex items-center gap-2 my-1">
                <span className="size-3" style={{ backgroundColor: color }} />
                <span className="text-xs">
                  {index === reversedColors.length - 1
                    ? `> ${reversedValues[index - 1]} (${
                        reversedLabels[index]
                      })`
                    : index === 0
                    ? `< ${reversedValues[index]} (${reversedLabels[index]})`
                    : `${reversedValues[index - 1]} — ${
                        reversedValues[index]
                      } (${reversedLabels[index]})`}
                </span>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    </div>
  );
}

export default SPEI_Legend;
