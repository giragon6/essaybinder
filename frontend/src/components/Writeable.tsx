// interface WriteableProps {
//   value: string;
//   placeholder?: string;
//   disabled?: boolean;
//   maxLength?: number;

//   onSave: (value: string) => void;
//   onChange?: (value: string) => void;
//   onCancel?: () => void;

//   className?: string;
//   variant?: WriteableVariant;
// }

// export type WriteableVariant = 'default' | 'inline' | 'block';

// export function Writeable(props: WriteableProps) {
//   const {
//     value,
//     placeholder = 'Type here...',
//     disabled = false,
//     maxLength = 5000,
//     onSave,
//     onChange,
//     onCancel,
//     className = '',
//     variant = 'default'
//   } = props;

//   return (
//     <div className={variant === 'inline' ? 'writeable-inline' : 'writeable-block'}>
//       <span> { value ? value } </span>
//     </div>
//   );
// }