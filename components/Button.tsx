'use client';
import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';

type Props = {
  label: string;
} & Omit<MuiButtonProps, 'children'>;

export function Button({ label, ...rest }: Props) {
  return <MuiButton {...rest}>{label}</MuiButton>;
}


