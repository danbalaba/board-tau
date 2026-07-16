import { renderHook, act } from '@testing-library/react';
import { useControllableState } from '../use-controllable-state';

describe('useControllableState', () => {
  it('works as uncontrolled state when prop is undefined', () => {
    const { result } = renderHook(() =>
      useControllableState<string>({ defaultProp: 'default' })
    );

    const [value] = result.current;
    expect(value).toBe('default');

    act(() => {
      const [, setValue] = result.current;
      setValue('new value');
    });

    const [updatedValue] = result.current;
    expect(updatedValue).toBe('new value');
  });

  it('works as controlled state when prop is provided', () => {
    const onChange = jest.fn();
    const { result, rerender } = renderHook(
      (props: { prop: string }) =>
        useControllableState<string>({ prop: props.prop, onChange }),
      { initialProps: { prop: 'controlled' } }
    );

    const [value] = result.current;
    expect(value).toBe('controlled');

    // Calling setValue should trigger onChange but NOT update the internal value directly
    act(() => {
      const [, setValue] = result.current;
      setValue('attempted new value');
    });

    expect(onChange).toHaveBeenCalledWith('attempted new value');
    
    // Value stays the same because it is controlled by the prop
    expect(result.current[0]).toBe('controlled');

    // Only updates when prop changes
    rerender({ prop: 'actual new value' });
    expect(result.current[0]).toBe('actual new value');
  });

  it('handles function updates in controlled mode', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useControllableState<number>({ prop: 5, onChange })
    );

    act(() => {
      const [, setValue] = result.current;
      setValue((prev = 0) => prev + 1);
    });

    // 5 + 1 = 6
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('handles function updates in uncontrolled mode', () => {
    const { result } = renderHook(() =>
      useControllableState<number>({ defaultProp: 10 })
    );

    act(() => {
      const [, setValue] = result.current;
      setValue((prev = 0) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
  });
});
