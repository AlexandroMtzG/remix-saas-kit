import ButtonSecondary from "./buttons/ButtonSecondary";
import SlideOver from "./slideOvers/SlideOver";
import { useState } from "react";
import clsx from "clsx";
import PreviewBreadcrumbs from "./breadcrumbs/PreviewBreadcrumbs";
import PreviewTabsAsLinks from "./tabs/PreviewTabsAsLinks";
import PreviewTabsAsButtons from "./tabs/PreviewTabsAsButtons";
import PreviewButtons from "./buttons/PreviewButtons";
import PreviewButtonsAsLinks from "./buttons/PreviewButtonsAsLinks";
import PreviewButtonsDestructive from "./buttons/PreviewButtonsDestructive";
import PreviewDropdownsSimple from "./dropdowns/PreviewDropdownsSimple";
import PreviewDropdownsWithClick from "./dropdowns/PreviewDropdownsWithClick";
import PreviewModals from "./modals/PreviewModals";
import PreviewBanners from "./banners/PreviewBanners";
import PreviewEmptyStates from "./emptyState/PreviewEmptyStates";
import PreviewUploadersDocument from "./uploaders/PreviewUploadersDocument";
import PreviewPdfViewers from "./pdf/PreviewPdfViewers";
import PreviewLoaders from "./loaders/PreviewLoaders";

interface Props {
  className?: string;
  withSlideOvers?: boolean;
}

export default function AllComponentsList({ className, withSlideOvers }: Props) {
  const [showRightSlideOver, setShowRightSlideOver] = useState(false);
  return (
    <div>
      <div className={clsx(className, "space-y-6 pb-12 p-4 mx-auto max-w-2xl text-slate-900")}>
        <div className="space-y-1">
          <h3 className="font-medium text-sm">Breadcrumbs</h3>
          <div className="flex items-center space-x-2 p-2 border-dashed border-gray-300 border">
            <PreviewBreadcrumbs />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Tab - as Links</h3>
          <div className="flex items-center space-x-2 p-2 border-dashed border-gray-300 border">
            <PreviewTabsAsLinks />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Tab - as Buttons</h3>
          <div className="p-2 border-dashed border-gray-300 border">
            <PreviewTabsAsButtons />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Buttons</h3>
          <div className="bg-white p-6 border-dashed border-gray-300 border">
            <PreviewButtons />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Buttons - as Links</h3>
          <div className="bg-white p-6 border-dashed border-gray-300 border">
            <PreviewButtonsAsLinks />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Buttons - Destructive</h3>
          <div className="bg-white p-6 border-dashed border-gray-300 border">
            <PreviewButtonsDestructive />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Dropdowns - Simple</h3>
          <div className="space-x-2 bg-white p-6 border-dashed border-gray-300 border">
            <PreviewDropdownsSimple />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Dropdowns</h3>
          <div className="space-x-2 bg-white p-6 border-dashed border-gray-300 border">
            <PreviewDropdownsWithClick />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Modals</h3>
          <div className="bg-white p-6 border-dashed border-gray-300 border">
            <PreviewModals />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Banners</h3>
          <div className="bg-white p-6 border-dashed border-gray-300 border">
            <PreviewBanners />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Empty States</h3>
          <div className="bg-white p-6 border-dashed border-gray-300 border">
            <PreviewEmptyStates />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Uploaders</h3>
          <div className="bg-white dark:bg-slate-900 p-6 border-dashed border-gray-300 dark:border-gray-700 border">
            <PreviewUploadersDocument />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Pdf Viewer</h3>
          <div className="bg-white p-6 border-dashed border-gray-300 border">
            <PreviewPdfViewers />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">Loaders</h3>
          <div className="bg-white p-6 border-dashed border-gray-300 border">
            <PreviewLoaders />
          </div>
        </div>

        {withSlideOvers && (
          <div className="space-y-1">
            <h3 className="font-medium text-sm">Slide-overs</h3>
            <div className="bg-white p-6 border-dashed border-gray-300 border">
              <ButtonSecondary onClick={() => setShowRightSlideOver(!showRightSlideOver)}>Right slide-over</ButtonSecondary>
            </div>
          </div>
        )}

        {/*SlideOver */}
        {showRightSlideOver && <SlideOver onClose={() => setShowRightSlideOver(false)}>Your content here...</SlideOver>}
      </div>
    </div>
  );
}
