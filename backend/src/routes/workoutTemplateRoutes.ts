import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { 
    createTemplate, 
    getTemplates, 
    getTemplate,
    updateTemplate, 
    deleteTemplate 
} from '../controllers/workoutTemplateController';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTemplate);
router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;
