import {useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogTitle,} from "@/components/ui/dialog";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {Button} from "@/components/ui/button";

type WarningProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    onProceed: () => Promise<void>;
};

export const Warning = ({ open, setOpen, onProceed }: WarningProps) => {
    const [loading, setLoading] = useState(false);

    const handleProceed = async () => {
        setLoading(true);
        try {
            await onProceed();
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen} modal>
            <DialogContent className="sm:max-w-[600px] [&>button]:hidden bg-white">
                <VisuallyHidden>
                    <DialogTitle>Form Submission Warning</DialogTitle>
                </VisuallyHidden>
                <div className="relative text-sm text-gray-800">
                    <p className="mb-2">
                        <strong>Warning:</strong> If you click proceed, you may <strong>NOT</strong> be able to update this application again.
                    </p>
                    <p>Please make sure your form is complete and accurate before proceeding.</p>
                </div>
                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="min-w-[100px] cursor-pointer"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleProceed}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 min-w-[100px] justify-center cursor-pointer"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Submit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

