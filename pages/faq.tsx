import { Disclosure } from "@headlessui/react";
import Link from "next/link";

const faqs = [
  {
    question: "How was this website built?",
    answer: (
      <span>
        It was built with the{" "}
        <Link href="https://operand.ai">
          <a className="cursor-pointer underline">Operand API</a>
        </Link>
        , and the source code for this website is available{" "}
        <Link href="https://github.com/operandinc/rssalert">
          <a className="underline cursor-pointer">here</a>
        </Link>
        .
      </span>
    ),
  },
  {
    question: "How do we make money?",
    answer: (
      <span>
        We make money from developers and businesses using our API to build apps
        (like this one). We don't make any money directly from this website.
      </span>
    ),
  },
  {
    question: "What makes a good query?",
    answer: (
      <span>
        A great query will describe a specific idea or concept in a few words.
        For example, you'd get better results with a query like 'bullet train in
        florence' than you would with 'train'.
      </span>
    ),
  },
  {
    question: "What are thresholds?",
    answer: (
      <span>
        The threshold represents the percentage similarity between a piece of
        document content and your query.
      </span>
    ),
  },
  {
    question: "What are the differences between semantic and full-text search?",
    answer: (
      <span>
        Full-text search is perhaps more traditional, and looks at the
        keywords/text itself to find matches. Semantic search relies on the
        "semantic similarity" between two pieces of text, i.e. how similar they
        are in meaning.
      </span>
    ),
  },
  {
    question: "I don't want to get alerts any more. How can I shut them off?",
    answer: (
      <span>
        Login with your email{" "}
        <Link href="/login">
          <a className="underline cursor-pointer">here</a>
        </Link>
        , then check your email for a secure link. On that link, you'll be able
        to see all your active triggers and optionally delete them.
      </span>
    ),
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function FAQ() {
  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 mx-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl tracking-tight font-bold text-gray-900">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Have a question that isn't listed here?{" "}
          <Link href="mailto:support@operand.ai">
            <a className="underline cursor-pointer">Get in touch</a>
          </Link>
          !
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="max-w-3xl mx-auto divide-y-2 divide-gray-200">
            <dl className="space-y-6 divide-y divide-gray-200">
              {faqs.map((faq, i) => (
                <Disclosure
                  as="div"
                  key={faq.question}
                  className={i != 0 ? "pt-6" : ""}
                >
                  {({ open }) => (
                    <>
                      <dt className="text-lg">
                        <Disclosure.Button className="text-left w-full flex justify-between items-start text-gray-400">
                          <span className="font-medium text-gray-900">
                            {faq.question}
                          </span>
                          <span className="ml-6 h-7 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className={classNames(
                                open ? "-rotate-180" : "rotate-0",
                                "h-6 w-6 transform"
                              )}
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                              />
                            </svg>
                          </span>
                        </Disclosure.Button>
                      </dt>
                      <Disclosure.Panel as="dd" className="mt-2 pr-12">
                        <p className="text-base text-gray-500">{faq.answer}</p>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
