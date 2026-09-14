import { useState, useEffect, useCallback } from 'react';
import { getCachedAttributes, getSyncAttributes } from '@/lib/landlordTaxonomyCache';

export function useDynamicAttributes() {
  const [attributes, setAttributes] = useState<any[]>(() => getSyncAttributes() || []);

  useEffect(() => {
    let isMounted = true;
    getCachedAttributes().then((attrs) => {
      if (isMounted && attrs && attrs.length > 0) {
        setAttributes(attrs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const resolveAmenityName = useCallback(
    (attrId: string) => {
      if (!attrId) return '';
      const cleanId = attrId.includes('|') ? attrId.split('|')[0] : attrId;
      const matched = attributes.find(
        (a: any) =>
          a.id === cleanId ||
          a.value === cleanId ||
          a._id === cleanId ||
          a.code === cleanId ||
          (typeof cleanId === 'string' && cleanId.startsWith(a.id + '|'))
      );
      if (matched) return matched.name || matched.label || matched.title || matched.value;
      if (!/^[a-f0-9]{24}$/i.test(cleanId)) {
        return cleanId.replace(/_/g, ' ').replace(/-/g, ' ');
      }
      return cleanId;
    },
    [attributes]
  );

  return { attributes, resolveAmenityName };
}

export default useDynamicAttributes;
