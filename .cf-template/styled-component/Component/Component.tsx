import React, { forwardRef, HtmlHTMLAttributes } from 'react';
import * as S from './#Component.styled';

interface #ComponentProps extends HtmlHTMLAttributes<HTMLDivElement> {
}

const #Component = forwardRef<HTMLDivElement, #ComponentProps>(
  (props: #ComponentProps, ref) => {
    return (
      <S.#Component>
        Content
      </S.#Component>
    );
  }
);

#Component.displayName = '#Component';
#Component.defaultProps = {
};

export default #Component;
