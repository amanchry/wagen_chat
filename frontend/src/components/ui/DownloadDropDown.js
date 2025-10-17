import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

function DownloadDropDown({ children, size = false }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`inline-flex size-[38px] ${size && "!text-lg"} items-center justify-center text-violet11 outline-none hover:bg-violet3 hover:bg-[var(--blue-3)]`}
          aria-label="Customise options"
        >
          <span className="icon-IconDownloadSimple"></span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] rounded-sm bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
          sideOffset={6}
          align="end"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default DownloadDropDown;
