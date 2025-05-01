import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

export default function FAQ() {
    const faqs = [
        {
            title: "How to pay & access application forms",
            description: "1. Navigate to https://register.healthtraining.gov.gh\n\n2. Click on make payment & Register\n3.⁠ ⁠Read the instructions in RED LABEL and complete the form\n4.⁠ ⁠Click on Pay GHS150\n5.⁠ ⁠Select the payment method and input required details, Click Pay Now.\n6.⁠ ⁠PIN & Serial number is sent to the registered email address & phone number\n7.⁠ ⁠Click on continue and input pin and serial to access the form.\n"
        },
        {
            title: "What is the Health Training Application Portal?",
            description: "It is an online platform for applying to accredited health training institutions across Ghana, allowing you to complete your application, payment, and follow-up processes online."
        },
        {
            title: "Who can apply through the portal?",
            description: "All qualified individuals who meet the admission requirements of health training institutions in Ghana."
        },
        {
            title: "Can I apply to multiple institutions or programs?",
            description: "Yes, but you must submit a separate application and make payment for each one."
        },
        {
            title: "Can I edit my application after submission?",
            description: "No. Once submitted, applications cannot be edited. Ensure all information is correct before submitting."
        },
        {
            title: "What payment methods are accepted?",
            description: "Payments can be made via mobile money, Visa/MasterCard, and other integrated digital payment options."
        },
        {
            title: "How secure is my personal and payment information?",
            description: "The portal uses advanced encryption and data protection measures to secure all information."
        },
        {
            title: "Is the application fee refundable?",
            description: "The application fee is non-refundable, except in cases where the Ministry cancels the admission exercise. Please review our refund policy for more details."
        }
    ];

    return (
        <section className="py-16 bg-white">
            <div className="container">
                <div className="text-center mb-12">
                    <h3 className="section-title h3">Frequently Asked Questions</h3>
                    <p className="section-title p">
                        Find answers to common questions about the admission process.
                    </p>
                </div>

                <Accordion type="multiple" className="w-full space-y-4">
                   {faqs.map((faq, index) => ( 
                    <div key={index}>
                        <AccordionItem value={`item-${index}`} className="border border-green-200 rounded-lg bg-white print:shadow-none print:border-gray-300">
                        <div className="flex items-center justify-between px-6 py-4 bg-green-50 hover:bg-green-100 rounded-t-lg transition-colors">
                            <AccordionTrigger className="flex-1 text-base font-semibold hover:no-underline p-0 print:text-lg text-green-600 hover:text-green-700">
                                {faq.title}
                            </AccordionTrigger>
                        </div>
                        <AccordionContent className="px-4 sm:px-6 pb-4 pt-0">
                            <div className="space-y-3 w-full sm:w-auto">
                                <p>
                                    {faq.description}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    </div>
                   )) }
                </Accordion>
            </div>
        </section>
    );
}