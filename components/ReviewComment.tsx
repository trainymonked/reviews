import { FC, Key } from 'react'
import { IReview } from './Review'

export interface IReviewComment {
    id: Key
    text: String
    review: IReview
    reviewId: Key
    author: any
    authorId: Key
}

const ReviewComment: FC = () => {
    return <>Review component</>
}

export default ReviewComment
