// app/admin/features/moderation/components/reviews-moderation/review-table.tsx
'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Star, CheckCircle, XCircle, Eye, MessageCircle, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  listing: string;
  user: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface ReviewTableProps {
  reviews: Review[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
}

export function ReviewTable({ reviews, onApprove, onReject, onView }: ReviewTableProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              "w-3.5 h-3.5 fill-current",
              s <= rating ? "text-amber-400" : "text-muted/40"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-[32px] border border-border/40 bg-card/20 backdrop-blur-md overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6 px-10">Entity & Author</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6">Reputation</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6">Sentiment Narrative</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6">History</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6 text-right pr-6">Moderation Control</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review, index) => (
            <motion.tr
              key={review.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group border-b border-border/40 hover:bg-primary/[0.02] transition-colors"
            >
              <TableCell className="py-5 px-10">
                <div className="flex flex-col gap-0.5">
                  <span className="font-black text-sm tracking-tighter uppercase whitespace-nowrap">{review.listing}</span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase">
                    <User className="w-3 h-3" />
                    {review.user}
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-5">
                <div className="flex flex-col gap-1.5">
                  {renderStars(review.rating)}
                  <span className="text-[9px] font-black uppercase text-amber-500/80 tracking-widest italic">{review.rating}.0 Tier</span>
                </div>
              </TableCell>

              <TableCell className="py-5 max-w-[300px]">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium text-foreground/80 italic leading-relaxed line-clamp-2">
                    "{review.comment}"
                  </p>
                  {review.comment.length > 50 && (
                    <span className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em]">Read Expanded Sentiment</span>
                  )}
                </div>
              </TableCell>

              <TableCell className="py-5 whitespace-nowrap">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/40">
                  <Calendar className="w-4 h-4 text-emerald-500/60" />
                  {new Date(review.submittedAt).toLocaleDateString()}
                </div>
              </TableCell>

              <TableCell className="py-5 pr-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onView(review.id)}
                    className="h-10 w-10 border-border/40 bg-card/60 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm group/btn"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {review.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onApprove(review.id)}
                        className="h-10 w-10 border-emerald-500/20 bg-emerald-500/5 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-500/10"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onReject(review.id)}
                        className="h-10 w-10 border-rose-500/20 bg-rose-500/5 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm shadow-rose-500/10"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
