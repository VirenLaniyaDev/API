import express from 'express'

import { deleteUser, updateUser, getAllUsers } from '../controllers/users'
import { isAuthenticated, isOwner } from '../middleware/common'

export default (router: express.Router) => {
    router.get('/users', isAuthenticated, getAllUsers);
    router.delete('/users/:id', isAuthenticated, isOwner, deleteUser);
    router.put('/users/:id', isAuthenticated, isOwner, updateUser);
}