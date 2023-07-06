import classes from './Button.module.css';
import clsx from 'clsx';
import { Button as BSButton } from 'react-bootstrap';

export enum ButtonColor {
  Pink,
  White,
  Yellow,
  WhiteYellow,
  Green,
  Purple,
  PurpleLight,
  Gray,
  Red,
}

export interface ButtonProps {
  text: string;
  bgColor: ButtonColor;
  disabled?: boolean;
  onClick?: (e: any) => void;
  classNames?: string[] | string;
}

const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  const { text, bgColor, disabled, onClick, classNames } = props;

  const bgColorClass =
    bgColor === ButtonColor.Pink
      ? classes.btnPinkBg
      : bgColor === ButtonColor.Purple
      ? classes.btnPurpleBg
      : bgColor === ButtonColor.PurpleLight
      ? classes.btnPurpleLightBg
      : bgColor === ButtonColor.White
      ? classes.btnWhiteBg
      : bgColor === ButtonColor.Yellow
      ? classes.btnYellowBg
      : bgColor === ButtonColor.Green
      ? classes.btnGreenBg
      : bgColor === ButtonColor.Red
      ? classes.btnRedBg
      : bgColor === ButtonColor.Gray
      ? classes.btnGrayBg
      : classes.btnWhiteYellowBg;

  return (
    <BSButton
      className={clsx(classes.btn, bgColorClass, classNames)}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </BSButton>
  );
};

export default Button;
