'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  type FaqQuestion,
  reasonFaqs,
  ReportReasons,
} from '@/constants/report-reasons';
import { cn } from '@/lib/utils';
import { reportSchema } from '@/schemas';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useCreateReport } from '../_api/use-create-report';

const FormSchema = reportSchema;

export function ReportForm({
  postId,
  setOpen,
}: {
  postId?: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { mutate, isPending } = useCreateReport(postId);
  const [step, setStep] = useState<number>(1); // Step 1: Reason, Step 2: MCQ, Step 3: Textarea, Step 4: Additional Info

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      reason: ReportReasons[0], // Set the first reason as default
      faqs: [],
      additionalInfo: '',
    },
  });

  const selectedReason = form.watch('reason');

  // Update FAQs when reason changes
  useEffect(() => {
    // Reset faqs array when reason changes
    form.setValue('faqs', []);

    // If there are FAQs for this reason, initialize the faqs array
    const currentFaqs = reasonFaqs[selectedReason] || [];
    if (currentFaqs.length > 0) {
      const initialFaqs = currentFaqs.map((faq) => ({
        question: faq.question,
        answer: '',
      }));
      form.setValue('faqs', initialFaqs);
    }

    // Reset to step 1 when reason changes
    setStep(1);
  }, [selectedReason, form]);

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    mutate(values, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  const renderReasonItem = (reason: string) => (
    <FormItem key={reason} className='flex items-center space-x-3 space-y-0'>
      <FormControl>
        <RadioGroupItem
          disabled={isPending}
          className={cn(
            selectedReason === reason && 'border-tertiary text-tertiary'
          )}
          value={reason}
        />
      </FormControl>
      <FormLabel className='font-normal'>{reason}</FormLabel>
    </FormItem>
  );

  const renderFaqField = (faq: FaqQuestion, index: number) => {
    return (
      <FormField
        key={faq.id}
        control={form.control}
        name={`faqs.${index}.answer`}
        render={({ field }) => (
          <FormItem className='space-y-2 mt-4'>
            <FormLabel>{faq.question}</FormLabel>
            <FormControl>
              {faq.type === 'mcq' && faq.options ? (
                <Select
                  disabled={isPending}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select an option' />
                  </SelectTrigger>
                  <SelectContent>
                    {faq.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Textarea
                  disabled={isPending}
                  placeholder='Your answer'
                  {...field}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // Get FAQs for the selected reason
  const currentFaqs = reasonFaqs[selectedReason] || [];

  // Filter FAQs by type for different steps
  const mcqFaqs = currentFaqs.filter((faq) => faq.type === 'mcq');
  const textareaFaqs = currentFaqs.filter((faq) => faq.type === 'textarea');

  // Check if we have questions for each step
  const hasMcqQuestions = mcqFaqs.length > 0;
  const hasTextareaQuestions = textareaFaqs.length > 0;

  // Determine the maximum step based on available questions
  const maxStep =
    2 + (hasMcqQuestions ? 1 : 0) + (hasTextareaQuestions ? 1 : 0);

  // Handle next step
  const handleNext = () => {
    // If current step is 1 (reason selection)
    if (step === 1) {
      // If there are MCQ questions, go to step 2
      if (hasMcqQuestions) {
        setStep(2);
      }
      // If there are only textarea questions, skip to step 3
      else if (hasTextareaQuestions) {
        setStep(3);
      }
      // If no questions at all, go to additional info step
      else {
        setStep(4);
      }
    }
    // If current step is 2 (MCQ questions)
    else if (step === 2) {
      // If there are textarea questions, go to step 3
      if (hasTextareaQuestions) {
        setStep(3);
      }
      // Otherwise, go to additional info step
      else {
        setStep(4);
      }
    }
    // If current step is 3 (textarea questions), go to additional info
    else if (step === 3) {
      setStep(4);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (step === 4) {
      // If coming back from additional info
      if (hasTextareaQuestions) {
        setStep(3);
      } else if (hasMcqQuestions) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (step === 3) {
      // If coming back from textarea questions
      if (hasMcqQuestions) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (step === 2) {
      // If coming back from MCQ questions
      setStep(1);
    }
  };

  // Get the indices of the FAQs in the original array
  const getMcqIndices = () => {
    return mcqFaqs.map((mcq) =>
      currentFaqs.findIndex((faq) => faq.id === mcq.id)
    );
  };

  const getTextareaIndices = () => {
    return textareaFaqs.map((textarea) =>
      currentFaqs.findIndex((faq) => faq.id === textarea.id)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Step 1: Select Reason */}
        {step === 1 && (
          <div className='space-y-6'>
            <div className='text-sm text-muted-foreground mb-4'>
              Step 1 of {maxStep}: Select a reason for your report
            </div>

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>What would you like to report?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className='flex flex-col space-y-1'
                    >
                      {ReportReasons.map(renderReasonItem)}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end'>
              <Button
                type='button'
                onClick={handleNext}
                disabled={isPending}
                variant='tertiary'
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: MCQ Questions */}
        {step === 2 && hasMcqQuestions && (
          <div className='space-y-6'>
            <div className='text-sm text-muted-foreground mb-4'>
              Step 2 of {maxStep}: Answer multiple choice questions
            </div>

            <div className='space-y-4'>
              <h3 className='font-medium'>Multiple Choice Questions</h3>
              {getMcqIndices().map((index) =>
                renderFaqField(currentFaqs[index], index)
              )}
            </div>

            <div className='flex justify-between'>
              <Button
                type='button'
                onClick={handlePrevious}
                disabled={isPending}
                variant='outline'
              >
                Back
              </Button>
              <Button
                type='button'
                onClick={handleNext}
                disabled={isPending}
                variant='tertiary'
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Textarea Questions */}
        {step === 3 && hasTextareaQuestions && (
          <div className='space-y-6'>
            <div className='text-sm text-muted-foreground mb-4'>
              Step {hasMcqQuestions ? 3 : 2} of {maxStep}: Provide detailed
              information
            </div>

            <div className='space-y-4 rounded-md'>
              <h3 className='font-medium'>Detailed Information</h3>
              {getTextareaIndices().map((index) =>
                renderFaqField(currentFaqs[index], index)
              )}
            </div>

            <div className='flex justify-between'>
              <Button
                type='button'
                onClick={handlePrevious}
                disabled={isPending}
                variant='outline'
              >
                Back
              </Button>
              <Button
                type='button'
                onClick={handleNext}
                disabled={isPending}
                variant='tertiary'
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Additional Information */}
        {step === 4 && (
          <div className='space-y-6'>
            <div className='text-sm text-muted-foreground mb-4'>
              Step {maxStep} of {maxStep}: Additional information
            </div>

            <FormField
              control={form.control}
              name='additionalInfo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {"Is there anything else you'd like to share?"}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Add any additional details that might help us understand your report better...'
                      className='min-h-[120px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-between'>
              <Button
                type='button'
                onClick={handlePrevious}
                disabled={isPending}
                variant='outline'
              >
                Back
              </Button>
              <Button disabled={isPending} type='submit' variant='tertiary'>
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </form>
      <p className='text-white text-xs font-light text-center mt-4'>
        Reports are anonymous. We review all reports to ensure our guidelines
        are followed.
      </p>
    </Form>
  );
}
