import React from 'react';
import classes from './AddressAvatar.module.css';
import { useEnsAvatar } from 'wagmi';
import clsx from 'clsx';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

const AddressAvatar: React.FC<{ address: string; size?: number }> = props => {
  const { address, size: s = 24 } = props;

  const { data: avatar } = useEnsAvatar({ address: address as `0x${string}` });

  // const factory = new Factory<GlassesParts, GlassesBgColors>(NogglesData);
  // const generateGlasses = () => factory.createItem();
  // const glasses = generateGlasses().dataUrl;

  const size = s + 'px';

  return (
    <div style={{ display: 'flex' }}>
      {avatar ? (
        <img
          style={{ height: size, width: size }}
          className={clsx(!avatar && classes.glasses)}
          src={avatar!}
          alt='avatar'
        />
      ) : (
        <Jazzicon diameter={s!} seed={jsNumberForAddress(address)} />
      )
      }
    </div>
  );
};

export default AddressAvatar;
