import React from 'react';
import { renderHook, act } from '@testing-library/react';
import useMultistepForm from '../use-multistep-form';

describe('useMultistepForm', () => {
  const steps = [
    <div key="1">Step 1</div>,
    <div key="2">Step 2</div>,
    <div key="3">Step 3</div>,
  ];

  it('initializes with the first step correctly', () => {
    const { result } = renderHook(() => useMultistepForm(steps));

    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.step).toEqual(steps[0]);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
    expect(result.current.steps).toEqual(steps);
  });

  it('navigates to the next step correctly', () => {
    const { result } = renderHook(() => useMultistepForm(steps));

    act(() => {
      result.current.next();
    });

    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.step).toEqual(steps[1]);
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);
  });

  it('does not navigate past the last step', () => {
    const { result } = renderHook(() => useMultistepForm(steps));

    act(() => {
      result.current.next(); // Index 1
      result.current.next(); // Index 2 (last step)
      result.current.next(); // Should stay at Index 2
    });

    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.isLastStep).toBe(true);
  });

  it('navigates to the previous step correctly', () => {
    const { result } = renderHook(() => useMultistepForm(steps));

    act(() => {
      result.current.next(); // Go to Index 1
      result.current.back(); // Go back to Index 0
    });

    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
  });

  it('does not navigate backwards past the first step', () => {
    const { result } = renderHook(() => useMultistepForm(steps));

    act(() => {
      result.current.back();
    });

    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
  });

  it('navigates to a specific step index using goTo', () => {
    const { result } = renderHook(() => useMultistepForm(steps));

    act(() => {
      result.current.goTo(2);
    });

    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.isLastStep).toBe(true);

    act(() => {
      result.current.goTo(0);
    });

    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
  });
});
